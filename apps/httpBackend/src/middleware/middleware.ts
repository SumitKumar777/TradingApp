import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../routes/auth/auth";


declare global {
   namespace Express {
      interface Request {
         userId: string
         userName:string
      }
   }
}

export default function authUser(req:Request,res:Response,next:NextFunction){
   const token=req.cookies.AuthCookie;
   if(!token){
      return res.status(401).json({status:"error",message:"cookie is found"})
   }

   try {
      const { id, userName } = jwt.verify(token, JWT_SECRET) as JwtPayload;

      req.userId=id;
      req.userName=userName;

      next();
   } catch (error:unknown) {
      console.log("error in authUserMiddleware",error);
      res.status(401).json({status:"error",message:"invalid cookie",error })
   }
 
}