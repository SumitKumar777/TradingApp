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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fetchBalance } from "./UserBalance";
import { useUser } from "../store/useUser";

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
		const setBalance=useUser((state)=>state.setBalance);
		
	const form = useForm<PlaceOrderType>({
		resolver: zodResolver(placeOrderSchema),
		defaultValues: {
			quantity: "",
			takeProfit: "",
			stopLoss: "",
		},
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
				form.setError("takeProfit",{
					type: "manual",
					message: "For buy order takeProfit should be greater than the currentPrice",
				});
				return;
			}
			if (stopls && stopls > tokenPrice) {
				form.setError("takeProfit", {
					type: "manual",
					message:
						"For buy order stopLoss should be lesser than the currentPrice",
				});
				return;
			}
			}else{
				if (takeprft && takeprft > tokenPrice) {
					form.setError("takeProfit", {
						type: "manual",
						message:
							"For Sell order takeProfit should be lesser than the currentPrice",
					});
					return;
				}
				if (stopls && stopls < tokenPrice) {
					form.setError("takeProfit", {
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
			const updatedBalance=await fetchBalance();
										setBalance(updatedBalance);
			form.reset({
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

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit((data) =>
						placeOrderSubmit(data, state ? "long" : "short")
					)}
					className="space-y-8"
				>
					<FormField
						control={form.control}
						name="quantity"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Quantity</FormLabel>
								<FormControl>
									<Input
										placeholder="Quantity"
										{...field}
										onInput={handleNumericInput}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="takeProfit"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Take Profit</FormLabel>
								<FormControl>
									<Input
										placeholder="Take Profit"
										{...field}
										onInput={handleNumericInput}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="stopLoss"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Stop Loss</FormLabel>
								<FormControl>
									<Input
										placeholder="Stop Loss"
										{...field}
										onInput={handleNumericInput}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Place {state ? "Buy" : "Sell"} Order</Button>
				</form>
			</Form>
		</div>
	);
}

export default PlaceOrder;
