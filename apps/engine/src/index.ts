import { createClient } from "redis";
import { startOrderProcesser } from "./orderProcessor";
import { priceEvent } from "./common/common";


const tokenPriceSubscriber=createClient();



// fetch the price of btc 

async function startEnigne(){
   try {

      const tokenPrice = await tokenPriceSubscriber.subscribe("bitcoin", (message) => {
         const parsedData = JSON.parse(message);
         const price=parsedData.data.p;
         priceEvent.emit("priceUpdate",price);
      });


   } catch (error) {
      console.log("error in the engine in getting the price",error);
   }

}



async function main(){
   await tokenPriceSubscriber.connect();
    startEnigne()
    startOrderProcesser();
}


main().catch(error=>console.log("error in engine",error));


