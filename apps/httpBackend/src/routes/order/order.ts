// endpoints related orders placement and order history
import { Router } from "express";
import pgPool from "@repo/timescaledb";
import {authUser} from "../../middleware/middleware";
import z from "zod";
import Decimal from "decimal.js";
import prisma from "@repo/db";
import { connectRedisClient } from "@repo/redisclient";




const orderRouter:Router=Router();
const placeOrderSchema = z.object({
   quantity: z.string().min(1, { message: "too short quantity must be provided" }).max(5, { message: "too large for quantity " }).regex(/^\d+(\.\d+)?$/).transform(v => new Decimal(v)),
   entryPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(v => new Decimal(v)),
   takeProfit: z.string().optional().transform(v => v ? new Decimal(v) : null),
   stopLoss: z.string().optional().transform(v => v ? new Decimal(v) : null),
   type: z.enum(["limit", "market"]),
   position: z.enum(["long", "short"]),
});

const closeOrderSchema=z.object({

})






// place order


let httpRedisClient;
// create order 
//          model Orders{
//   id Int @id @default (autoincrement())
//   userId String
//   amount Decimal
//   quantity Int
//   type OrderType
//   position OrderPosition
//   status OrderStatus
//   pnl Decimal
//   takeProfit  Decimal ?
//   stopLoss  Decimal ?
//   entryPrice Decimal
//   exitPrice Decimal ?
//   closingReason ClosingReason @default (Automatic)
//   orderCreatedAt  DateTime @default (now())
//   orderClosedAt   DateTime ?
//   updatedAt DateTime @updatedAt
//   user  User @relation(fields: [userId], references: [id])
//          }



orderRouter.post("/placeorder",authUser, async(req,res)=>
   {
      // received the order details
      const data=placeOrderSchema.safeParse(req.body);
      if(!data.success){
         return res.status(401).json({status:"error",message:"invalid inputs for placing order",error:data.error});
      }

      const userId=req.userId;
      const {data:orderData}=data;

      try {
         // check balance for placing order 

         const balance=await prisma.user.findUnique({
            where:{
               id:userId
            },
            select:{
               walletBalance:true
            }
         })

         console.log("balance",balance);

         const ordervalue = orderData.quantity.mul(orderData.entryPrice);
         console.log( ordervalue,"orderValue", balance?.walletBalance,"wallet Balance");
         if(!balance){
            return res.status(400).json({ status: "error", message: " balance not found" });
         }

         const walletBalance = new Decimal(balance.walletBalance.toString());
         if (ordervalue.greaterThan(walletBalance)) {
            return res.status(400).json({ status: "error", message: "Insufficient balance" });
         }

         let placeOrder;
         try {
             placeOrder=await prisma.$transaction(async(tx)=>{
               await tx.user.update({
                  where:{
                     id:userId
                  },
                  data:{
                     walletBalance:{
                        decrement:ordervalue
                     }
                  }
               })
                return await prisma.orders.create({
                   data: {
                      userId,
                      amount: ordervalue,
                      quantity: orderData.quantity,
                      type: orderData.type === "limit" ? "Limit" : "Market",
                      position: orderData.position === "long" ? "Long" : "Short",
                      status: "Open",
                      takeProfit: orderData.takeProfit ? orderData.takeProfit : null,
                      stopLoss: orderData.stopLoss ? orderData.stopLoss : null,
                      entryPrice: orderData.entryPrice
                   },
                })
            })
            

         } catch (error) {
            console.log("error in the placing order",error);
            return res.status(500).json({ status: "error", message: "order Not created", error });

         }


         console.log(placeOrder, "order created successfully");



         httpRedisClient=await connectRedisClient();

         const addToStream = await httpRedisClient.xAdd("orderList", "*", { orderData: JSON.stringify(placeOrder)});

         console.log("order added to the stream",addToStream);

         return res.status(201).json({status:"success",message:"order Created Successfully",data:placeOrder})

      } catch (error) {
         console.log("error in the placing order",error);
         return res.status(500).json({status:"error",message:"order Not created",error});
      }

})

// close order

orderRouter.post("/closeorder",async(req,res)=>{
   return res.status(201).json({
      status: "success", message: "order closed",})
})

// orderHistory 

orderRouter.get("/getorderhistory",async(req,res)=>{
   return res.status(201).json({
      status: "success", message: "order history",});
})

export default orderRouter;
