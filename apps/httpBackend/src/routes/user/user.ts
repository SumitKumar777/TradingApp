// endpoints related user details 

import { Router } from "express";
import{ authUser }from "../../middleware/middleware";
import z from "zod";
import Decimal from "decimal.js";
import prisma from "@repo/db";


const userRouter:Router=Router();

const depositSchema=z.object({
   amount: z.string().min(1, { message: "too short quantity must be provided" }).max(10, { message: "too large for quantity " }).regex(/^\d+(\.\d+)?$/).transform(v => new Decimal(v)),
})

userRouter.get("/userdetail",authUser,(req,res)=>{
   res.status(200).json({status:"success",message:"user detail"})
})


userRouter.post("/walletdeposit",authUser ,async(req,res)=>{
   const reqBodyData=depositSchema.safeParse(req.body);

   if(!reqBodyData.success){
      return res.status(401).json({status:"error",message:"invalid deposit Request",error:reqBodyData.error});
   }

   const userId=req.userId;

   try {
      const adduserBalance=await prisma.user.update({
         where:{
            id:userId
         },
         data:{
            walletBalance:{
               increment:new Decimal(reqBodyData.data.amount)
            }
         }
      })
      return res.status(201).json({status:"success",message:"deposited Successfully",data:adduserBalance.walletBalance});
   } catch (error) {
      console.log("error in adding user balance",error);
      return res.status(500).json({status:"error",message:"Failed to add balance",error});
   }

})



export default userRouter;