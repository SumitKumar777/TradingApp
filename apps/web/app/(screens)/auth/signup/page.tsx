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
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
 


export default function Signup() {

	const router = useRouter(); 
	const form=useForm<SignupType>({resolver:zodResolver(signUpObject),
		defaultValues:{
			name:"",
			email:"",
			password:""
		}
	});


	const onSubmit=async(values:SignupType)=>{
		
		try {
		const {name,email,password}=values;


			if (!name || !email || !password) {
				throw new Error("Required fields are missing");
			}

			const signupRes = await axios.post(
				"http://localhost:3001/api/auth/signup",
				{ name, email, password }
			);

			if (signupRes.data.status !== "success") {
				throw new Error("Internal server error");
			}

			console.log(signupRes, "signupRes");



			router.push("/auth/signin");
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.log("Error while signup:", error.message);
			} else {
				console.log("Unexpected error while signup:", error);
			}
		}

	}

	// const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
	// 	e.preventDefault();
	// 	const form = e.currentTarget;

	// 	try {
	// 		const formData = new FormData(form);

	// 		const username = formData.get("name")?.toString();
	// 		const email = formData.get("email")?.toString();
	// 		const password = formData.get("password")?.toString();

	// 		if (!username || !email || !password) {
	// 			throw new Error("Required fields are missing");
	// 		}

	// 		const signupRes = await axios.post(
	// 			"http://localhost:3001/api/auth/signup",
	// 			{ name: username, email, password }
	// 		);

	// 		if (signupRes.data.status !== "success") {
	// 			throw new Error("Internal server error");
	// 		}

	// 		console.log(signupRes, "signupRes");

	// 		form.reset();

		
	// 		router.push("/auth/signin"); 
	// 	} catch (error: unknown) {
	// 		if (error instanceof Error) {
	// 			console.log("Error while signup:", error.message);
	// 		} else {
	// 			console.log("Unexpected error while signup:", error);
	// 		}
	// 	}
	// };



	// return (
	// 	<div>
	// 		<h1>SignUp for Paapay Trade</h1>
	// 		<form onSubmit={handleSignup}>
	// 			<label htmlFor="name">Username</label>
	// 			<input type="text" name="name" id="name" />

	// 			<label htmlFor="email">Email</label>
	// 			<input type="text" name="email" id="email" />

	// 			<label htmlFor="password">Password</label>
	// 			<input type="password" name="password" id="password" />

	// 			<button type="submit">Signup</button>
	// 		</form>
	// 	</div>
	// );
	 return (
			<div className="flex items-center justify-center h-screen ">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-8 w-full max-w-md bg-white p-8 rounded-lg shadow"
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

						<Button type="submit" className=" w-full">Submit</Button>
					</form>
				</Form>
			</div>
		);
}
