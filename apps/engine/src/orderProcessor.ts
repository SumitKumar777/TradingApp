import { createClient } from "redis";
import { priceEvent } from "./common/common";


const orderProcessorClient=createClient();


const orders = [];



priceEvent.on("priceUpdate",(data)=>{
   console.log("bitcoin price in orderProcessor",data);
})

export async function startOrderProcesser(){

  

   await orderProcessorClient.connect();

   let lastId="$";


   while(true){
      const orderDetials = await orderProcessorClient.xRead(
         [{ key: "orderLists", id: "$" }],
         { BLOCK: 0, COUNT: 1 },
      );

      if(orderDetials){
         console.log("orderDetails",orderDetials);

         orders.push(orderDetials);
      }
   }
}



