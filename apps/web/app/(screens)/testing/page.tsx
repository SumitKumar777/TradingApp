"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {z }from "zod";
import { Button } from "@/components/ui/button";

const demoType=z.object({
   name:z.string().min(4,{message:"too short for name"}),
   email:z.email()
})

export default function MyForm() {


	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: zodResolver(demoType) });

	const onSubmit = (data:any) => console.log(data);

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<input {...register("name")} placeholder="Name" />
			{errors.name && <p>{errors.name.message}</p>}
			<br />
			<input {...register("email")} placeholder="Email" />
			{errors.email && <p>{errors.email.message}</p>}
			<br />
			<Button className="bg-amber-200 hover:bg-red-600">Submit</Button>
		</form>
	);
}
