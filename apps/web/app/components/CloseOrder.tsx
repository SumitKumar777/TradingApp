"use client";

import { useEffect, useState } from "react";


function CloseOrder() {
   const [closedOrder,setClosedOrder]=useState(null);

   useEffect(()=>{

      async function fetchCloseOrder(){
         // setInterval and fetch the order and set every 2 second and display it 
      }

      fetchCloseOrder()
   })




   return ( 
      <>
      <h1>hi there from close order</h1>
      </>
    );
}

export default CloseOrder;