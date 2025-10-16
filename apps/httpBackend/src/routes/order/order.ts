// endpoints related orders placement and order history
import { Router } from "express";
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

const closeOrderSchema = z.object({
   id: z.string()
      .min(1, { message: "id cannot be empty" })
      .regex(/^\d+$/, { message: "id must be a number" }) 
      .transform(v => Number(v))
});




// place order



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



         const httpRedisClient=await connectRedisClient();

         const addToStream = await httpRedisClient.xAdd("orderList", "*", { orderData: JSON.stringify(placeOrder)});

         console.log("order added to the stream",addToStream);

         return res.status(201).json({status:"success",message:"order Created Successfully",data:placeOrder})

      } catch (error) {
         console.log("error in the placing order",error);
         return res.status(500).json({status:"error",message:"order Not created",error});
      }

})

// close order

orderRouter.post("/closeorder",authUser,async(req,res)=>{
   const reqBodyData= closeOrderSchema.safeParse(req.body);
   if(!reqBodyData.success){
      return res.status(401).json({status:"error",message:"invalid request body/ id must be provided",error:reqBodyData.error});
   }
   const orderid=reqBodyData.data.id;
   try {

      const checkIfClosed=await prisma.orders.findUnique({
         where:{
            id:orderid
         }
      })
      if(checkIfClosed?.status==="Closed"){
         return res.status(201).json({ status: "success", message: "order is already closed" });
      }
      const httpRedisClient = await connectRedisClient();


      const addToStream = await httpRedisClient.xAdd("order:close_request", "*", { closeOrderData: reqBodyData.data.id.toString() });
      console.log("close Order request add to stream", addToStream);


      return res.status(201).json({
         status: "success", message: "order closed",
      })
   } catch (error) {
      console.log("error in closing the order ",error);
      return res.status(500).json({status:"failed",message:"Internal server error in closing the order",error})
   }
})

// orderHistory 

orderRouter.get("/orderhistory",authUser,async(req,res)=>{
   const userId=req.userId;
   try {
      const orderHistory=await prisma.user.findUnique({
         where:{
            id:userId
         },
         include:{
            orders:{
               orderBy:{
                  orderClosedAt:"asc"
               }
            }
         }
      })
      return res.status(200).json({status:"succes",message:`order history for this user ${userId}`,data:orderHistory?.orders});
   } catch (error) {
      console.log("error in getting the order history ",error);
      return res.status(500).json({status:"failed",message:"Internal server error in getting the order history",error})
   }
   
})

export default orderRouter;
