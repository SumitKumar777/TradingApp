"use client";

import { useState } from "react";
import usePrice from "../store/usePrice";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const placeOrderSchema = z.object({
	quantity: z
		.string()
		.min(1, { message: "Quantity is required" })
		.max(5, { message: "Quantity too large" })
		.regex(/^\d+(\.\d+)?$/, { message: "Quantity must be a number" }),
	takeProfit: z.string().optional(),
	stopLoss: z.string().optional(),
});


const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
	let value = e.currentTarget.value;
	value = value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");

	value = value.replace(/^(\d+)(\.\d{0,2})?.*$/, (_, intPart, decimalPart) => {
		return intPart + (decimalPart || "");
	});

	e.currentTarget.value = value;
};
type PlaceOrderType = z.infer<typeof placeOrderSchema>;

function PlaceOrder() {
	const [state, setState] = useState(true);
	const tokenPrice = usePrice((state) => state.tokenPrice);
	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
		reset
	} = useForm<PlaceOrderType>({
		resolver: zodResolver(placeOrderSchema),
	});

	const placeOrderSubmit = async (
		data: PlaceOrderType,
		type: "long" | "short"
	) => {
		try {
			const { quantity, takeProfit, stopLoss } = data;
			const takeprft = takeProfit ? parseFloat(takeProfit) :undefined;
			const stopls = stopLoss ? parseFloat(stopLoss) : undefined;

			if(type==="long"){

			if (takeprft && takeprft < tokenPrice) {
				setError("takeProfit",{
					type: "manual",
					message: "For buy order takeProfit should be greater than the currentPrice",
				});
				return;
			}
			if (stopls && stopls > tokenPrice) {
				setError("takeProfit", {
					type: "manual",
					message:
						"For buy order stopLoss should be lesser than the currentPrice",
				});
				return;
			}
			}else{
				if (takeprft && takeprft > tokenPrice) {
					setError("takeProfit", {
						type: "manual",
						message:
							"For Sell order takeProfit should be lesser than the currentPrice",
					});
					return;
				}
				if (stopls && stopls < tokenPrice) {
					setError("takeProfit", {
						type: "manual",
						message:
							"For Sell order stopLoss should be greater than the currentPrice",
					});
					return;
				}
			}



			const placeResq = await axios.post(
				`http://localhost:3001/api/order/placeorder`,
				{
					quantity,
					entryPrice: tokenPrice.toString(),
					takeProfit,
					stopLoss,
					type: "market",
					position: type,
				},
				{ withCredentials: true }
			);
			console.log("placeOrderRequest", placeResq);
			reset({
				quantity: "",
				takeProfit: "",
				stopLoss: "",
			});
		} catch (error) {
			if (error instanceof Error) {
				console.log("error while placing order", error.message);
			} else {
				console.log("unexpected error while placing order", error);
			}
		}
	};

	return (
		<div>
			<div className="border-2 text-xl">
				<Button
					className={`${state ? "bg-gray-600" : "bg-gray-500"} p-2`}
					onClick={() => setState(true)}
				>
					Buy
				</Button>
				<Button
					className={`${!state ? "bg-gray-700" : "bg-gray-500"} p-2 border-red-500`}
					onClick={() => setState(false)}
				>
					Sell
				</Button>
			</div>

			<form
				onSubmit={handleSubmit((data) =>
					placeOrderSubmit(data, state ? "long" : "short")
				)}
				className={`border-1 p-4 ${
					state ? "border-green-300" : "border-red-500"
				}`}
			>
				<label>Enter quantity</label>
				<br />
				<input
					{...register("quantity")}
					placeholder="Quantity"
					onInput={handleNumericInput}
				/>
				{errors.quantity && (
					<p className="text-red-500">{errors.quantity.message}</p>
				)}
				<br />

				<label>Take Profit</label>
				<br />

				<input
					{...register("takeProfit")}
					placeholder="Take Profit"
					onInput={handleNumericInput}
				/>
				{errors.takeProfit && (
					<p className="text-red-500">{errors.takeProfit.message}</p>
				)}
				<br />

				<label>Stop Loss</label>
				<br />

				<input
					{...register("stopLoss")}
					placeholder="Stop Loss"
					onInput={handleNumericInput}
				/>
				{errors.stopLoss && (
					<p className="text-red-500">{errors.stopLoss.message}</p>
				)}
				<br />

				<Button type="submit">
					{state ? "Place Buy Order" : "Place Sell Order"}
				</Button>
			</form>
		</div>
	);
}

export default PlaceOrder;
