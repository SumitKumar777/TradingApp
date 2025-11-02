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
import { toast } from "sonner";
import { formatNumber } from "./CloseOrder";

const placeOrderSchema = z.object({
	quantity: z
		.string()
		.min(1, { message: "Quantity is required" })
		.max(5, { message: "Quantity too large" })
		.regex(/^\d+(\.\d+)?$/, { message: "Quantity must be a number" }),
	takeProfit: z.string().optional(),
	stopLoss: z.string().optional(),
});


export const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
	let value = e.currentTarget.value;
	value = value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");

	value = value.replace(/^(\d+)(\.\d{0,2})?.*$/, (_, intPart, decimalPart) => {
		return intPart + (decimalPart || "");
	});

	e.currentTarget.value = value;
};
type PlaceOrderType = z.infer<typeof placeOrderSchema>;

function PlaceOrder({className}:{className:string}) {


	const [state, setState] = useState(true);
	const tokenPrice = usePrice((state) => state.tokenPrice);
	const setBalance=useUser((state)=>state.setBalance);
	const balance=useUser((state)=>state.balance);
		
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

			const totalOrderAmount=Number(quantity)* tokenPrice;
			console.log(totalOrderAmount,"totalOrderAmount in place Order");

			if(balance < totalOrderAmount){
				throw new Error("Insufficient Balance for this order")
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
			const formattedBalance= formatNumber(updatedBalance)
			setBalance(Number(formattedBalance));
			toast.success(`Order Successfully Created with quantity ${quantity} and orderValue ${totalOrderAmount}`);

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
			toast.error((error as Error).message);
		}
	};

	return (
		<div className={`w-full md:pt-10 ${className}`}>
			<div className="flex w-full border-2 text-xl gap-2">
				<Button
					className={`${state && "bg-green-600"}  flex-1 rounded-none hover:bg-green-500`}
					onClick={() => setState(true)}
				>
					Buy
				</Button>
				<Button
					className={`${!state && "bg-red-600"}  flex-1 rounded-none hover:bg-red-500`}
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
					className="space-y-8 py-6 px-2"
				>
					<FormField
						control={form.control}
						name="quantity"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-lg">Quantity</FormLabel>
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
								<FormLabel className="text-lg">
									Take Profit <p className="opacity-75">(Optional)</p>
								</FormLabel>
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
								<FormLabel className="text-lg">
									Stop Loss <p className="opacity-75"> (Optional)</p>
								</FormLabel>
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
					<div className="flex justify-center">
						<Button
							type="submit"
							className={`${state ? "bg-green-600 " : "bg-red-600"} w-[80%] rounded-none`}
						>
							Place {state ? "Buy" : "Sell"} Order
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

export default PlaceOrder;
