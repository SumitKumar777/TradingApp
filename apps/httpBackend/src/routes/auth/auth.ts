import { Router } from "express";
import prisma from "@repo/db";
import z, { email } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const JWT_SECRET = "tklashdfnasfd2340234#20934";
const authRouter:Router=Router();

// Zod object;
const signUpObject=z.object({
   name:z.string(),
   email:z.email(),
   password:z.string().min(6,{message:"too short minimum should be 6 letters"}).max(14,{message:"too long maximum should be 14 character "})
})

const signInObject = z.object({
   email: z.email(),
   password: z.string().min(6, { message: "too short minimum should be 6 letters" }).max(14, { message: "too long maximum should be 14 character " })
})



// utility functions

async function hash(plain:string){
   const saltRounds=12;
   const hash=await bcrypt.hash(plain,saltRounds);
   return hash;
}

async function verifyPassword(plain:string,storedHash:string){
   return await bcrypt.compare(plain,storedHash);
}




// signUp

authRouter.post("/signup",async(req,res)=>{
   const reqBody=req.body;
   const parsedReqBody=signUpObject.safeParse(reqBody);
   if(!parsedReqBody.success){
      return res.status(400).json({status:"error",message:"invalid signup inputs",error:parsedReqBody.error})
   }

   try {
      const {name,email,password}=parsedReqBody.data;
      console.log(name,"name",email,"email",password,"password");
      const hashPassword=await hash(password);
      
      const createUser=await prisma.user.create({
         data:{
            username:name,
            email,
            password:hashPassword
            
         }
      })

      return res.status(201).json({status:"success",message:"user created successfully"})

   } catch (error) {
      console.log("error in signup",error);
      return res.status(500).json({status:"error",message:"internal server error"})
   }

})



authRouter.post("/signin", async (req, res) => {
   const reqBody = req.body;
   const parsedReqBody = signInObject.safeParse(reqBody);
   if (!parsedReqBody.success) {
      return res.status(400).json({ status: "error", message: "invalid signup inputs", error: parsedReqBody.error })
   }


   try {
      const { email, password } = parsedReqBody.data;
      console.log( email, "email", password, "password");

      const foundUser = await prisma.user.findFirst({
         where:{
            email
         },
         select:{
            id:true,
            username:true,
            password:true,
         }
      })

      if(!foundUser){
         return res.status(400).json({ status: "error", message: "user not found" })
      }

      const passwordVerify=await verifyPassword(password,foundUser.password);

      if(!passwordVerify){
         return res.status(400).json({ status: "error", message: "wrong password" })
      }

      const token=jwt.sign({id:foundUser.id,userName:foundUser.username},JWT_SECRET);


      return res.status(200).cookie("AuthCookie",token,{maxAge:7*24*60*60*1000,httpOnly:true,secure:false}).json({ status: "success", message: "user created successfully" })

   } catch (error) {
      console.log("error in signup", error);
      return res.status(500).json({ status: "error", message: "internal server error" })
   }

})

export default authRouter;