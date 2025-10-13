// endpoints related orders placement and order history
import { Router } from "express";
import pgPool from "@repo/timescaledb";
import authUser from "../../middleware/middleware";
import z from "zod";
import Decimal from "decimal.js";

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

orderRouter.post("/placeorder",authUser, async(req,res)=>
   {
      // received the order details
      const data=placeOrderSchema.safeParse(req.body);
      console.log(data);


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
