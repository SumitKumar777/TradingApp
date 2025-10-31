// * order object comming from the websocket 

"use client";
import { useState } from "react";
import ClosedOrder from "./CloseOrder";
import OpenOrder from "./OpenOrder";



function OrderDetails() {

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
				<div className="w-full overflow-x-scroll">
					{orderState ? (
						<OpenOrder/>
					) : (
						<ClosedOrder />
					)}
				</div>
			</div>
		);
}

export default OrderDetails;