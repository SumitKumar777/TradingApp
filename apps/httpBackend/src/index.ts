import prisma from "@repo/db";
import express from "express";
import type { Express, Request, Response } from "express";

import {Testing} from "@repo/types";


const app=express();
const PORT=3001;

app.use(express.json());




app.get("/test",(req:Request,res:Response)=>{

   res.status(200).json({message:"this is good thing"});
})

console.log("hi there http backend");

app.listen(PORT,()=>console.log(`the app is listening on port ${PORT}`))