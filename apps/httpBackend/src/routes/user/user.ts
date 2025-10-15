// endpoints related user details 

import { Router } from "express";
import{ authUser }from "../../middleware/middleware";
import z from "zod";
import Decimal from "decimal.js";
import prisma from "@repo/db";


const userRouter:Router=Router();

const depositSchema = z.object({
   amount: z
      .string()
      .min(1, { message: "Too short, more amount must be provided" })
      .max(10, { message: "Too large for amount" })
      .regex(/^\d+(\.\d{1,2})?$/, { message: "Amount must have at most 2 decimal places" })
      .transform((v) => new Decimal(v)),
});

userRouter.get("/userdetail",authUser,async(req,res)=>{
   const userId=req.userId;

   try {
      const userDetail=await prisma.user.findUnique({
         where:{
            id:userId
         }
      })
      return res.status(200).json({ status: "success", message: " user details", data: userDetail });
   } catch (error) {
      
   }

   res.status(200).json({status:"success",message:"user detail"})
})


userRouter.post("/walletdeposit",authUser ,async(req,res)=>{
   const reqBodyData=depositSchema.safeParse(req.body);

   if(!reqBodyData.success){
      const errorMessage=JSON.parse(reqBodyData.error.message);
      return res.status(401).json({status:"error",message:"invalid deposit Request",error:errorMessage});
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
   } catch (error:unknown) {
      if(error instanceof Error){
         console.log("error in adding user balance", error);
         return res.status(500).json({ status: "error", message: "Failed to add balance", error: error.message });
      }else{
         console.log("error in adding user balance", error);
         return res.status(500).json({ status: "error", message: "Unexpected error and Failed to add balance", error });
      }
   }
})



export default userRouter;