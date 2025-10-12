// endpoints related user details 

import { Router } from "express";
import authUser from "../../middleware/middleware";


const userRouter:Router=Router();


userRouter.get("/userdetail",authUser,(req,res)=>{
   res.status(200).json({status:"success",message:"user detail"})
})


userRouter.post("/walletdeposit",async(req,res)=>{
   res.status(200).json({ status: "success", message: "deposited money " });
})



export default userRouter;