import { createClient } from "redis";
import { priceEvent } from "./common/common";


const orderConsumerClient=createClient();
const orderUpdateProducer=createClient();



// {
//    [1]   id: 6,
//       [1]   userId: '405c2f5a-057a-4fd8-a112-acd7edb47a93',
//          [1]   amount: 5506.0551,
//             [1]   quantity: 2.37,
//                [1]   type: 'Market',
//                   [1]   position: 'Long',
//                      [1]   status: 'Open',
//                         [1]   pnl: null,
//                            [1]   takeProfit: null,
//                               [1]   stopLoss: null,
//                                  [1]   entryPrice: 2323.23,
//                                     [1]   exitPrice: null,
//                                        [1]   closingReason: 'Automatic',
//                                           [1]   orderCreatedAt: 2025 - 10 - 15T17: 49: 57.783Z,
//                                              [1]   orderClosedAt: null,
//                                               [1]   updatedAt: 2025 - 10 - 15T17: 49: 57.783Z
//                                                 [1]
// }

type PositionType = "Long" | "Short";
type OrderStatus = "Open" | "Closed";
type ClosingReasonType = "Automatic" | "Manual";
type OrderExecutionType = "Market" | "Limit";

interface OrderType {
   id: number;
   userId: string;
   amount: number;
   quantity: number;
   type: OrderExecutionType;
   position: PositionType;
   status: OrderStatus;
   pnl?: string | null;
   takeProfit?: string | null;
   stopLoss?: string | null;
   entryPrice: number;
   exitPrice: number | null;
   closingReason: ClosingReasonType;
   orderCreatedAt: string; 
   orderClosedAt: string | null;
   updatedAt: string;
}





const orderMap:Map<number,OrderType>=new Map();

const allOpenOrders:Set<OrderType>=new Set();
const allLimitOrders:Set<OrderType>=new Set();



// functiton to close order on and update the db and send the updated orders to redis stream  in orders:updated which will be picked up by the websocket server 
// function to check if the order has hit stop loss 
// function to check if the order has hit take profit
// function to calculate the pnl on the basis of order like short or long type 
// function to has the limit order has hit the prices if yes remove from the array and put them in allOpenorder and send their updates to the 





priceEvent.on("priceUpdate",(data)=>{
   console.log("bitcoin price in orderProcessor",data);
   process(data);

})



async function process(price: any) {
   

   for (const element of allOpenOrders) {
      
      const pnl = price;

      const updatedOrder = {
         id: element.id.toString(),
         userId: element.userId.toString(),
         moneyInvested: element.amount.toString(),
         pnl: pnl.toString(),
      };
      console.log(updatedOrder, "updatedOrder");

      const addUpdatedOrder = await orderUpdateProducer.xAdd("orders:updated", "*", updatedOrder);
      console.log("order added to stream with this userId", element.id);
   }
}


export async function startOrderProcesser(){

   await orderConsumerClient.connect();
   await orderUpdateProducer.connect();
   


   while(true){
      const orderDetials = await orderConsumerClient.xRead(
         [{ key: "orderList", id: "$" }],
         { BLOCK: 0, COUNT: 1 },
      );

      if(orderDetials){
         //@ts-ignore
         const orderDetailData = orderDetials[0].messages[0];
         console.log("orderDetails",typeof orderDetailData.message,"order",orderDetailData.message);
         const parsedOrderData:OrderType=JSON.parse(orderDetailData.message.orderData);

         orderMap.set(orderDetailData.id,parsedOrderData);

         if(parsedOrderData.type==="Market"){
            allOpenOrders.add(parsedOrderData);
         }{
            allLimitOrders.add(parsedOrderData);
         }

      }
   }

}

console.log("hello from engine");


