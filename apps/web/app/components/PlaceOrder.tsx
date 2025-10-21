"use client";

import { useState } from "react";
import usePrice from "../store/usePrice";

function PlaceOrder() {
   const [state,setState]=useState(true);
   const tokenPrice=usePrice(state=>state.tokenPrice);
   
   return (
			<div>
				<div className="">
					<button
						className={`${state ? "bg-grey-700" : "bg-grey-500"} p-2 text-amber-100`}
						onClick={() => {
							if (!state) {
								setState(true);
							}
						}}
					>
						Buy
					</button>
					<button
						className={!state ? "bg-grey-700" : "bg-grey-500"}
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
					<form>
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
						<button>Place Buy order</button>
					</form>
				) : (

					<form>
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
						<button>Place Sell order</button>
					</form>
				)}
			</div>
		);
}

export default PlaceOrder;