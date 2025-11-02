"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useUser } from "../store/useUser";
import { Plus } from "lucide-react";
import { handleNumericInput } from "./PlaceOrder";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {depositMoney,DepositMoney} from "@repo/types"
import {toast} from "sonner";
import { Spinner } from "@/components/ui/spinner";



 export const fetchBalance = async () => {
		try {
			const res = await axios.get("http://localhost:3001/api/user/getbalance", {
				withCredentials: true,
			});
			return res.data.data.walletBalance;
		} catch (err) {
			console.log("error while fetching balance", err);
			return err;
		}
 };

export default function UserBalance() {
	
	const balnc = useUser((state) => state.balance);
	const setBalnc = useUser((state) => state.setBalance);

	const [loading, setLoading] = useState(true);
	const [addMoneyLoading, setAddMoneyLoading] = useState(false);

	const [error, setError] = useState<string | null>(null);

	const form=useForm<DepositMoney>({resolver:zodResolver(depositMoney),
		defaultValues:{
			amount:""
		}
	})



	  const loadBalance = async () => {
		try {
			const res = await fetchBalance();
			setBalnc(res);
		} catch (err) {
         console.log("error while fetching balance",err);
			setError("Failed to fetch balance");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadBalance();
	}, []);

	const onSubmit=async(values:DepositMoney)=>{

		try {
			console.log(values,"values in the function")
		const {amount} = values;
		

		if (Number(amount) <= 0) {
			throw new Error("Amount cannot be smaller than 0 ")
		}

		setAddMoneyLoading(true);
			await axios.post(
				"http://localhost:3001/api/user/walletdeposit",
				{ amount},
				{ withCredentials: true }
			);
			await new Promise(resolve=>setTimeout(resolve,1000));
			setAddMoneyLoading(false);
			const updatedBalance = await fetchBalance();
			setBalnc(updatedBalance);
			toast.success(`Amount ${amount} successfully credited to your account`)

		} catch (err) {
			setAddMoneyLoading(false);
			if (err instanceof Error) {
				console.log("error while placing order", err.message);
			} else {
				console.log("unexpected error while placing order", err);
			}
			toast.error("Failed to add money to your account");
		}

	}




	return (
		<div className="flex items-center gap-2">
			{loading ? (
				<div className="flex gap-1 items-center">
					<p>Loading balance </p>
					<Spinner />
				</div>
			) : error ? (
				<p className="text-red-500">{error}</p>
			) : (
				<p>Balance: $ {balnc ?? 0}</p>
			)}

			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline" className="rounded-md border-2 ">
						<Plus  />
					</Button>
				</DialogTrigger>

				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Add Money</DialogTitle>
						<DialogDescription>Deposit money to your account</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xl">Amount</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter deposit amount"
												{...field}
												onInput={handleNumericInput}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline" type="button">
										close
									</Button>
								</DialogClose>
								<Button type="submit" disabled={addMoneyLoading}>
									{addMoneyLoading ? <Spinner /> : "Add"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
