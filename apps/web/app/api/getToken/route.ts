import { cookies } from "next/headers";
import { NextResponse } from "next/server";





export async function GET(){

   try {
      const getCookie = (await cookies()).get("AuthCookie");
      if(!getCookie){
         throw new Error("no cookie was found");
      }
      return NextResponse.json({status:"success",message:"cookie successfully extracted",cookie:getCookie.value},{status:200});
   } catch (error:unknown) {
      if(error instanceof Error){
         console.log("error in getting the cookie",error.message);
      }else{
         console.log("unexpected Error in getting the cookie",error);
      }
      return NextResponse.json({ status: "error", message: "cookie unsuccessfully extracted", cookie: null }, { status: 500 });
   }
}