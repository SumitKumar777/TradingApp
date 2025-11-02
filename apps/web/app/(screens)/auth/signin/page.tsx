"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
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
import { signInObject, SigninType } from "@repo/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";



export default function Signin() {
	const router = useRouter();
	const [loading,setLoading]=useState<boolean>(false);
		const form=useForm<SigninType>({resolver:zodResolver(signInObject),
			defaultValues:{
				email:"",
				password:""
			}
		});

	const onSubmit=async(values:SigninType)=>{
			try {

				const {email,password}=values;


				if (!password || !email) {
					throw new Error("Required fields are missing");
				}
				setLoading(true);
				const signInRes = await axios.post(
					"http://localhost:3001/api/auth/signin",
					{ email, password },
					{ withCredentials: true }
				);

				if (signInRes.data.status !== "success") {
					throw new Error("Internal server error");
				}





				router.push("/dashboard");
			} catch (error: unknown) {
				// Display toast over here to  on failed signin 
				await new Promise<void>((resolve) => {
					setTimeout(() => resolve(), 1000);
				});
				setLoading(false);
				if (error instanceof Error) {
					console.log("Error while signin:", error.message);
				} else {
					console.log("Unexpected error while signin:", error);
				}
					toast.error(`Error while Signin ${(error as Error).message}`);
			}
	}
	

	

	return (
		<div className="flex items-center justify-center h-screen ">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6 shadow w-full max-w-md p-8 rounded-lg"
				>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xl">Email</FormLabel>
								<FormControl>
									<Input placeholder="Enter your Registered email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xl">Password</FormLabel>
								<FormControl>
									<Input placeholder="Enter your password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full">
						{loading ? <Spinner /> : null}Submit
					</Button>
					<div className="flex gap-1">
						<p>Don&apos;t have an account?</p>
						<Link href={"/auth/signup"} className=" font-semibold hover:underline">SignUp</Link>

					</div>
				</form>
			</Form>
		</div>
	);
	
}
