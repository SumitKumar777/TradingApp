"use client";

import { useState } from "react";
import usePrice from "../store/usePrice";
import axios from "axios";


// const placeOrderSchema = z.object({
// 	quantity: z
// 		.string()
// 		.min(1, { message: "too short quantity must be provided" })
// 		.max(5, { message: "too large for quantity " })
// 		.regex(/^\d+(\.\d+)?$/)
// 		.transform((v) => new Decimal(v)),
// 	entryPrice: z
// 		.string()
// 		.regex(/^\d+(\.\d+)?$/)
// 		.transform((v) => new Decimal(v)),
// 	takeProfit: z
// 		.string()
// 		.optional()
// 		.transform((v) => (v ? new Decimal(v) : null)),
// 	stopLoss: z
// 		.string()
// 		.optional()
// 		.transform((v) => (v ? new Decimal(v) : null)),
// 	type: z.enum(["limit", "market"]),
// 	position: z.enum(["long", "short"]),
// });

function PlaceOrder() {
   const [state,setState]=useState(true);
   const tokenPrice=usePrice(state=>state.tokenPrice);

   const placeOrder=async(e:React.FormEvent<HTMLFormElement>,type: "long"|"short")=>{
      e.preventDefault();
      const form=e.currentTarget;

      try {
         const formData= new FormData(form);

         const quantity=formData.get("quantity");
         const takeprofit=formData.get("takeprofit");
         const stoploss=formData.get("stoploss");

         if(!quantity){
            throw new Error("Quantity is not provided in place order");
         }



         const placeResq=await axios.post(`http://localhost:3001/api/order/placeorder`,
            {
               quantity,
               entryPrice:tokenPrice.toString(),
               takeProfit:takeprofit,
               stopLoss:stoploss,
               type:"market",
               position:type
            },
            {withCredentials:true}
         )
         console.log("placeOrderRequest",placeResq); 
         form.reset();


      } catch (error) {
         if(error instanceof Error){
            console.log("error while placing order",error.message);
         }else{
            console.log("unexecpted error while placing order", error);
         }
      }
   }
   
   return (
			<div>
				<div className="border-2 text-xl">
					<button
						className={`${state ? "bg-gray-600" : "bg-gray-500"} p-2  border-1`}
						onClick={() => {
							if (!state) {
								setState(true);
							}
						}}
					>
						Buy
					</button>
					<button
						className={`${!state ? "bg-gray-700" : "bg-gray-500"} p-2 border-1 border-red-500`}
						onClick={() => {
							if (state) {
								setState(false);
							}
						}}
					>
						Sell
					</button>
				</div>

				{state ? (
					<form
						onSubmit={(e) => placeOrder(e, "long")}
						className="border-1 border-green-300"
					>
						<label htmlFor="quantity">Enter quantity</label>
						<br />
						<input type="text" id="quantity" name="quantity" />
						<br />
						<label htmlFor="takeprofit">Take Profit</label>
						<br />
						<input type="text" id="takeprofit" name="takeprofit" />
						<br />
						<label htmlFor="stoploss">Stop Loss</label>
						<br />
						<input type="text" id="stoploss" name="stoploss" />
						<br />
						<button type="submit">Place Buy order</button>
					</form>
				) : (
					<form
						onSubmit={(e) => placeOrder(e, "short")}
						className="border-1 border-red-500 "
					>
						<label htmlFor="quantity">Enter quantity</label>
						<br />
						<input type="text" id="quantity" name="quantity" />
						<br />
						<label htmlFor="takeprofit">Take Profit</label>
						<br />
						<input type="text" id="takeprofit" name="takeprofit" />
						<br />
						<label htmlFor="stoploss">Stop Loss</label>
						<br />
						<input type="text" id="stoploss" name="stoploss" />
						<br />
						<button type="submit">Place Sell order</button>
					</form>
				)}
			</div>
		);
}

export default PlaceOrder;