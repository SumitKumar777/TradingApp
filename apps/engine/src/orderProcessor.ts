import { createClient } from "redis";
import prisma from "@repo/db";
import { priceEvent } from "./common/common";
import Decimal from "decimal.js";




const orderConsumerClient = createClient();
const orderUpdateProducer = createClient();



type PositionType = "Long" | "Short";
type OrderStatus = "Open" | "Closed";
type ClosingReasonType = "Automatic" | "Manual";
type OrderExecutionType = "Market" | "Limit";
type ClosingReason="Manual"|"Automatic";



interface OrderType {
   id: number;
   userId: string;
   amount: number;
   quantity: number;
   type: OrderExecutionType;
   position: PositionType;
   status: OrderStatus;
   pnl?: number | null;
   takeProfit?: number | null;
   stopLoss?: number | null;
   entryPrice: number;
   exitPrice: number | null;
   closingReason: ClosingReasonType;
   orderCreatedAt: Date;
   orderClosedAt: Date | null;
   updatedAt: Date;
}


const orderMap = new Map<number, OrderType>();
const allOpenOrders = new Set<OrderType>();
const allLimitOrders = new Set<OrderType>();
let closeingOrderId:number[]=[];


function calculatePnl(entryPrice: number, currentPrice: number, orderValue: number, type: PositionType): number {
   const pctChange =
      type === "Long"
         ? ((currentPrice - entryPrice) / entryPrice) * 100
         : ((entryPrice - currentPrice) / entryPrice) * 100;

   return orderValue * (pctChange / 100);
}

function orderToRedisFields(order: OrderType): Record<string, string> {
   return Object.fromEntries(
      Object.entries(order).map(([k, v]) => [k, v == null ? "" : v.toString()])
   );
}


async function closeOrder(order: OrderType, price: number, clsReason: ClosingReason) {
   allOpenOrders.delete(order);
   orderMap.delete(order.id);
   closeingOrderId = closeingOrderId.filter(id => id != order.id);


   const pnl = calculatePnl(order.entryPrice, price, order.amount, order.position);

   try {

      const closedOrder=await prisma.$transaction(async(tx)=>{
         const orderState=await tx.orders.findUnique({
            where:{
               id:order.id
            }
         })

         if(orderState?.status==="Closed")return orderState;


         await tx.user.update({
            where:{
               id:order.userId
            },
            data:{
               walletBalance: {
                  increment: new Decimal(pnl).plus(new Decimal(order.entryPrice))
               }
            }
         })

         return await tx.orders.update({
            where:{
               id:order.id
            },data:{
               status:"Closed",
               pnl: new Decimal(pnl),
               closingReason:clsReason,
               exitPrice:price,
               orderClosedAt:new Date()
            }
         })
      })

     
      return {...closedOrder,amount:Number(closedOrder.amount),quantity:Number(closedOrder.quantity),pnl:Number(closedOrder.pnl),takeProfit:Number(closedOrder.takeProfit),stopLoss:Number(closedOrder.stopLoss),entryPrice:Number(closedOrder.entryPrice),exitPrice:Number(closedOrder.exitPrice)};
   } catch (err) {
      allOpenOrders.add(order);
      orderMap.set(order.id,order);
      closeingOrderId.push(order.id);
      console.error("Error closing order:", err);
      return null;
   }
}


async function process(price: number) {

   const orders = Array.from(allOpenOrders);

   for (const order of orders) {
      const { takeProfit, stopLoss, position } = order;

      const hitTakeProfit =
         position === "Long" ? (takeProfit && price >= takeProfit) : (takeProfit && price <= takeProfit);

      const hitStopLoss =
         position === "Long" ? (stopLoss && price <= stopLoss) : (stopLoss && price >= stopLoss);

      let updatedOrder: OrderType | null = null;

      if (hitTakeProfit || hitStopLoss) {
         const closedOrder = await closeOrder(order, price,"Automatic");
         if (closedOrder) {
            const redisData = orderToRedisFields(closedOrder);
            await orderUpdateProducer.xAdd("orders:closed", "*", redisData);
            console.log("Order closed -> Stream:", closedOrder.id);
         }

      } else {
         const pnl = calculatePnl(order.entryPrice, price, order.amount, order.position);
         order.pnl = pnl;
         updatedOrder = order;
      }

      if (updatedOrder) {
         const redisData = orderToRedisFields(updatedOrder);
         await orderUpdateProducer.xAdd("orders:updated", "*", redisData);
         console.log("Order updated -> Stream:", updatedOrder.id);
      }
   }
   if(closeingOrderId.length>0){
      const copyClosingOrder=Array.from(closeingOrderId);

      for(const orderId of copyClosingOrder){
         const closingOrderDetails = orderMap.get(orderId);

         if (closingOrderDetails && Object.keys(closingOrderDetails).length > 0) {
            const closedOrder = await closeOrder(closingOrderDetails, price,"Manual");
            if (closedOrder) {
               const redisData = orderToRedisFields(closedOrder);
               await orderUpdateProducer.xAdd("orders:closed", "*", redisData);
               console.log("Order closed -> Stream:", closedOrder.id);
            }
         }
      }
   }
}

priceEvent.on("priceUpdate", (price) => {
   console.log("Bitcoin price in orderProcessor:", price);
   process(price);
});


export async function startOrderProcesser() {
   await Promise.all([orderConsumerClient.connect(), orderUpdateProducer.connect()]);
   console.log("Order processor started...");

   // fetch all the open order and put them into the state so that when the engine restarts it can recover the state 

   const allOpenOrdersFromDb=await prisma.orders.findMany({
      where:{
         status:"Open"
      }
   })


   for (const order of allOpenOrdersFromDb) {
      const recoveredOrder = {
         ...order, amount: Number(order.amount), quantity: Number(order.quantity), pnl: order.pnl ? Number(order.
            pnl) : null, takeProfit: order.takeProfit ? Number(order.takeProfit) : null, stopLoss: order.stopLoss ? Number(order.stopLoss) : null,
         entryPrice: Number(order.entryPrice), exitPrice: order.exitPrice ? Number(order.exitPrice) : null
      };
      allOpenOrders.add(recoveredOrder);
      orderMap.set(order.id, recoveredOrder);  
   }


   while (true) {
      const data = await orderConsumerClient.xRead(
         [{ key: "orderList", id: "$" },{key:"order:close_request",id:"$"}],
         { BLOCK: 0, COUNT: 1 }
      );

      if (!data) continue;
      // @ts-ignore
      const message = data[0].messages[0];
      if(message.message.orderData){
         const parsedRaw = JSON.parse(message.message.orderData);


         console.log("Parsedraw data", parsedRaw);
         const parsed: OrderType = {
            ...parsedRaw,
            amount: new Decimal(parsedRaw.amount),
            quantity: new Decimal(parsedRaw.quantity),
            entryPrice: new Decimal(parsedRaw.entryPrice),
            takeProfit: parsedRaw.takeProfit ? new Decimal(parsedRaw.takeProfit) : null,
            stopLoss: parsedRaw.stopLoss ? new Decimal(parsedRaw.stopLoss) : null,
            exitPrice: parsedRaw.exitPrice ? new Decimal(parsedRaw.exitPrice) : null,
            pnl: parsedRaw.pnl ? new Decimal(parsedRaw.pnl) : null,
            orderCreatedAt: parsedRaw.orderCreatedAt,
            orderClosedAt: parsedRaw.orderClosedAt,
            updatedAt: parsedRaw.updatedAt,
         };

         console.log( typeof parsed.id, "parsedDataid");

         orderMap.set(parsed.id, parsed);

         if (parsed.type === "Market") {
            allOpenOrders.add(parsed);
         } else {
            allLimitOrders.add(parsed);
         }

         console.log("New order added:", parsed.id);
      }
     

      if (message.message.closeOrderData){
         const parsedClosedOrderId = JSON.parse(message.message.closeOrderData);
         console.log(parsedClosedOrderId, "order Details");
         const data =orderMap.get(parsedClosedOrderId);
         if(data&& Object.keys(data).length > 0){
            closeingOrderId.push(parsedClosedOrderId)
         }
      }


     
   }
}

console.log("Hello from engine");
