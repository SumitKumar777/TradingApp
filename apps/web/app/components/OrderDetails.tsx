// * order object comming from the websocket 

"use client";
import { useState } from "react";
import useOrder from "../store/useOrder";

// amount: "132633.1263";
// closingReason: "Automatic";
// entryPrice: "107831.81";
// exitPrice: "";
// id: "61";
// orderClosedAt: "";
// orderCreatedAt: "2025-10-22T07:19:17.339Z";
// pnl: "72.84060000000143";
// position: "Long";
// quantity: "1.23";
// status: "Open";
// stopLoss: "";
// takeProfit: "10840";
// type: "Market";
// updatedAt: "2025-10-22T07:19:17.339Z";
// userId: "8ff01e0d-f71d-4247-869f-01fa81bcc3bb";


function OrderDetails() {
   const OrderDetails=useOrder((state)=>state.orderDetails);
   const [orderState,setOrderState]=useState(true);
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
            {orderState ?<div></div>:<div>hi from closed order</div>}
			</div>
		);
}

export default OrderDetails;