"use client";
import { useEffect, useState } from "react";
import CandleChart from "../../components/CandleChart";
import axios from "axios";
import usePrice from "../../store/usePrice";

import StockPrice from "../../components/StockPrice";
import PlaceOrder from "../../components/PlaceOrder";
import OrderDetails from "../../components/OrderDetails";

function DashBoard() {   
   const [socket,setSocket]=useState<WebSocket| null>(null);
   const setTokenPrice=usePrice((state)=>state.setTokenPrice);

   useEffect(()=>{

      async function connectToWebsocket() {
         try {
            const token = (await axios.get("/api/getToken")).data.cookie;
               console.log(token, "token");
               if (!token) {
                  throw new Error("Connection failed with websocket no cookie found")
               }

               const connection = new WebSocket(
                           `ws://localhost:8080/?token=${token}`
                        );

               connection.onopen=()=>{
                  console.log("connection established");
                  setSocket(connection);
               }

               connection.onmessage=(data)=>{
                  // console.log(data.data);
                  try {
                     const parsedData = JSON.parse(data.data);
                     const parsedMessage=JSON.parse(parsedData.message);
                     if (parsedData.type === "chartData") {
                        console.log(parsedMessage.data.k);
                     }
                     if (parsedData.type === "tokenPrice") {

                              console.log(
                                 parsedMessage.data.p
                              );
                              setTokenPrice(parsedMessage.data.p);
                  }
                  } catch (error) {
                  console.log(data,"data in the catch block",error);
                  }
               }

               connection.onerror=(err)=>{
                  console.log("error in the websocket connection",err);
               }
            

         } catch (error) {
            console.log("error in connecting to websoket in dashboard",error);
         }
      }

      connectToWebsocket()
   },[])

   return ( 
      <div>
         hi there from board
         <StockPrice/>
         <CandleChart/>
         <PlaceOrder/>
         <OrderDetails/>
      </div>
    );
}

export default DashBoard;