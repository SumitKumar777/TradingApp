// endpoints related charts candle;

import pgPool from "@repo/timescaledb";
import { Router } from "express";



const chartRouter:Router=Router();


chartRouter.get("/candles/:interval",async(req,res)=>{

   const interval=req.params.interval;
   const validInterval=["1","5","15"];

   if(!interval || !validInterval.includes(interval)){
      return res.status(400).json({status:"error",message:"received invalid Inputs"})
   }

   let query;
   if(interval=="1"){
      query =`select * from price_chart_data`;
   }else if ( interval=="5"){
      query = `select * from five_min_ohlc order by bucket asc`;
   }else if (interval=="15"){
      query = `select * from fifteen_min_ohlc order by bucket asc`;
   }else{
      return res.status(400).json({ status: "error", message: "received invalid interval" })
   }

   let client;
   try{
      client = await pgPool.connect();
      const candleFullData = await client.query(query);

      const candleData=candleFullData.rows;
      return res.status(201).json({ status: "success", message: "order details", data: candleData });

   } catch (error) {
      console.log("error in getting order details", error);

      return res.status(500).json({ status: "success", message: "order details", error })
   } finally {
      client?.release();
   }
})

export default chartRouter;

