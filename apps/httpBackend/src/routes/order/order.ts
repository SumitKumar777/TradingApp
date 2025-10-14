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


// const placeOrderSchema=z.object({
//    quantity:z.string().min(1,{message:"too short quantity must be provided"}).max(5,{message:"too large for quantity "}),
//    type: z.string().transform(val=>val.toLowerCase()).refine(val=>["limit","market"].includes(val),{
//       message: "Order type must be either 'limit' or 'market'",
//    }),
//    position:z.string().transform(val=>val.toLowerCase()).refine(val=>["long","short"].includes(val)),
//    takeProfit:z.string().optional(),
//    stopLoss:z.string().optional(),
//    entryPrice:z.string()
// })




// place order


let httpRedisClient;



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

         if (!balance || ordervalue > balance.walletBalance) {
            return res.status(400).json({ status: "error", message: "Insufficient balance" });
         }


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

         const createOrder=await prisma.orders.create({
            data:{
               userId,
               amount:ordervalue,
               quantity: orderData.quantity,
               type: orderData.type==="limit"? "Limit":"Market" ,
               position:orderData.position==="long"?"Long":"Short",
               status:"Open",
               takeProfit:orderData.takeProfit ? orderData.takeProfit :null,
               stopLoss:orderData.stopLoss ? orderData.stopLoss:null,
               entryPrice:orderData.entryPrice
            },
         })

         console.log(createOrder, "order created successfully");



         httpRedisClient=await connectRedisClient();

         const addToStream = await httpRedisClient.xAdd("orderList", "*", { orderData: JSON.stringify(createOrder)});

         console.log("order added to the stream",addToStream);

         return res.status(201).json({status:"success",message:"order Created Successfully",data:createOrder})

      } catch (error) {
         console.log("error in the placing order",error);
         return res.status(500).json({status:"error",message:"order Not created",error});
      }



    return res.status(201).json({status:"success",message:"order placed",data})
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
