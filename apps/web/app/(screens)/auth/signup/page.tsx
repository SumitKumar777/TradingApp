"use client";
import {toast} from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signUpObject,SignupType } from "@repo/types";
import { useForm } from "react-hook-form";
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
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

 


export default function Signup() {
	const router = useRouter();
	const [loading,setLoading]=useState<boolean>(false);
	const form = useForm<SignupType>({
		resolver: zodResolver(signUpObject),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	const onSubmit = async (values: SignupType) => {
		try {
			const { name, email, password } = values;

			if (!name || !email || !password) {
				throw new Error("Required fields are missing");
			}
			setLoading(true);
			const signupRes = await axios.post(
				"http://localhost:3001/api/auth/signup",
				{ name, email, password }
			);

			if (signupRes.data.status !== "success") {
				throw new Error("Internal server error");
			}



			router.push("/auth/signin");
		} catch (error: unknown) {
			await new Promise<void>((resolve) => {
				setTimeout(() => resolve(), 1000);
			});
			setLoading(false);
			if (error instanceof Error) {
				console.log("Error while signup:", error.message);
			} else {
				console.log("Unexpected error while signup:", error);
			}
			toast.error(`Error while Signup ${(error as Error).message}`);
		}
	};

	return (
		<div className="flex items-center justify-center h-screen ">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-7 w-full max-w-md bg-white p-8 rounded-lg shadow"
				>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xl">Username</FormLabel>
								<FormControl>
									<Input placeholder="Enter your username" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xl">Email</FormLabel>
								<FormControl>
									<Input placeholder="Enter your email" {...field} />
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
									<Input placeholder="Create a password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full">
						{loading ? <Spinner /> : null}Submit
					</Button>
					<div className="flex gap-1">
						<p>Already have an account?</p>
						<Link
							href={"/auth/signin"}
							className=" font-semibold hover:underline"
						>
							SignIn
						</Link>
					</div>
				</form>
			</Form>
		</div>
	);
}
