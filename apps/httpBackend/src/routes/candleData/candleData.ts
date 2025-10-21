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
      query =`select * from price_chart_data order by bucket asc`;
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
      // { time: '2018-12-23', open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
      const candleData=candleFullData.rows;
      console.log("hello from candleData");

      const formattedData = candleData.map((element) => ({
         time: element.bucket.toISOString().split('T')[0],
         open: Number(element.open),
         high: Number(element.high),
         low: Number(element.low),
         close: Number(element.close),
      }));
      const sortedData = formattedData
         .filter((d, i, arr) => i === 0 || d.time > arr[i - 1]!.time) 
         .sort((a, b) => a.time - b.time);

         console.log("sortedData",sortedData);


      return res.status(201).json({ status: "success", message: "order details", data: sortedData });

   } catch (error) {
      console.log("error in getting order details", error);

      return res.status(500).json({ status: "success", message: "order details", error })
   } finally {
      client?.release();
   }
})

export default chartRouter;

