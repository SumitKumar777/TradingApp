import express from "express";
import type { Express, Request, Response } from "express";
import cookieParser from "cookie-parser"
import cors from "cors";

import {Testing} from "@repo/types";

// file Imports 
import userRouter from "./routes/user/user";
import chartRouter from "./routes/candleData/candleData";
import orderRouter from "./routes/order/order";
import authRouter from "./routes/auth/auth";



const app=express();
const PORT=3001;

app.use(express.json());
app.use(cors());
app.use(cookieParser());


app.get("/test",(req:Request,res:Response)=>{

   res.status(200).json({message:"this is good thing"});
})

app.use("/api/user",userRouter);
app.use("/api/chart", chartRouter);
app.use("/api/order", orderRouter);
app.use("/api/auth",authRouter);

app.use((req,res)=>{
   res.status(404).send("invalid request");
})

console.log("hi there http backend");

app.listen(PORT,()=>console.log(`the app is listening on port ${PORT}`))