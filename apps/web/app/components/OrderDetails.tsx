// * order object comming from the websocket 

"use client";
import { useState } from "react";
import useOrder from "../store/useOrder";

import axios from "axios";
import ClosedOrder from "./CloseOrder";




function OrderDetails() {
   const OrderDetail=useOrder((state)=>state.orderDetails);
   const [orderState,setOrderState]=useState(true);

	const closedOrder=async(orderId:string)=>{
		try {
			console.log("closed Order function is called");
			const closeOrderResponse = await axios.post(
				"http://localhost:3001/api/order/closeorder",
				{ id: orderId },
				{ withCredentials: true }
			);
			console.log("closeOrderResponse",closeOrderResponse)

		} catch (error) {
			console.log("error in closing the order",error)
		}

	}
   return (
			<div>
				<div className="border-2 text-xl">
					<button
						className={`${orderState ? "bg-gray-600" : "bg-gray-500"} p-2  `}
						onClick={() => {
							if (!orderState) {
								setOrderState(true);
							}
						}}
					>
						Open Orders
					</button>
					<button
						className={`${!orderState ? "bg-gray-700" : "bg-gray-500"} p-2 border-1 `}
						onClick={() => {
							if (orderState) {
								setOrderState(false);
							}
						}}
					>
						closed Order
					</button>
				</div>
				{orderState ? (
					<div>
						{Array.from(OrderDetail.values()).map((order) => (
							<div key={order.id} className="flex space-x-4">
								<p>{order.id}</p>
								<p>{order.amount}</p>
								<p>{order.pnl}</p>
								<p>{order.userId}</p>
								<button type="button" onClick={()=>closedOrder(order.id)}>Close</button>
							</div>
						))}
					</div>
				) : (
					<ClosedOrder/>
				)}
			</div>
		);
}

export default OrderDetails;