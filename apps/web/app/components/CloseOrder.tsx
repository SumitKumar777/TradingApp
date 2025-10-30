"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import  {OrderTypeProp} from "../store/useOrder"


// amount: "110007.37";
// closingReason: "Automatic";
// entryPrice: "110007.37";
// exitPrice: "110016.56";
// id: 86;
// orderClosedAt: "2025-10-30T11:29:23.117Z";
// orderCreatedAt: "2025-10-30T11:29:14.401Z";
// pnl: "9.190000000002328";
// position: "Long";
// quantity: "1";
// status: "Closed";
// stopLoss: null;
// takeProfit: null;
// type: "Market";
// updatedAt: "2025-10-30T11:29:23.119Z";
// userId: "347db88f-e402-4056-84a3-10b95502dc47";



type ClosedOrderDetailsType = Omit<OrderTypeProp, "id" | "amount" > & {
	id: number;
};


function ClosedOrder() {
   const [loading,setLoading]=useState(true);
   const [closeOrder,setClosedOrder]=useState<ClosedOrderDetailsType[]|null>(null);
   const [error,setError]=useState<string|null>(null);

   useEffect(()=>{

      async function fetchCloseOrder(){
         // setInterval and fetch the order and set every 2 second and display it 
         try {
            const fetchClosedOrderData=await axios.get("http://localhost:3001/api/order/orderhistory",{
               withCredentials:true
            })
            setLoading(false);
				console.log("closedOrderData", fetchClosedOrderData.data);

           if(fetchClosedOrderData.data.status==="success"){
             setClosedOrder(fetchClosedOrderData.data.data);
           }


         } catch (error) {
            console.log("error in the fetching the order ",error);
            setError(JSON.stringify(error));
         }
      }

      fetchCloseOrder()
   },[])

   if(loading){
      return <div>Loading...</div>
   }
    if (error) {
			return <div>Error while fetching the details {error}</div>;
		}


   return (
			<>
				{closeOrder && closeOrder.length > 0 ? (
					<div>
						{closeOrder.map((order) => (
							<div key={order.id} className="flex space-x-4">
                        <p>{order.id}</p>
								<p>{order.quantity}</p>
								<p>{order.pnl}</p>
								<p>{order.position}</p>
								<p>{order.orderCreatedAt}</p>
								<p>{order.orderClosedAt}</p>
                        
							</div>
						))}
					</div>
				) : (
					<h1>NO past Order for this user</h1>
				)}
			</>
		);
}

export default ClosedOrder;