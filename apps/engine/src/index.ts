import { createClient } from "redis";
import { startOrderProcesser } from "./orderProcessor";
import { priceEvent } from "./common/common";


const tokenPriceSubscriber=createClient();



// fetch the price of btc 

async function startEnigne(){
   try {

      await tokenPriceSubscriber.connect();

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
   await startEnigne()
   await startOrderProcesser();
}


main().catch(error=>console.log("error in engine",error));



// fetch the order from the redis stream which the http backend will put in it 

// process the order add calculate the current profit and loss  of that trade and put that to websocket so that websocket can send that 

// add entry in the database when the order is closed 


