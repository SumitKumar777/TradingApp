// endpoints related orders placement and order history
import { Router } from "express";
import pgPool from "@repo/timescaledb";


const orderRouter:Router=Router();




// place order

orderRouter.post("/placeorder",async(req,res)=>{
    return res.status(201).json({status:"success",message:"order placed",})
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
