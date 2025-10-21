"use client";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Signin() {
	const router = useRouter();

	const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;

		try {
			const formData = new FormData(form);


			const email = formData.get("email")?.toString();
			const password = formData.get("password")?.toString();

		

			if (!password || !email ) {
				throw new Error("Required fields are missing");
			}  

			const signInRes = await axios.post(
				"http://localhost:3001/api/auth/signin",
				{ email,password},
            {withCredentials:true}
			);



			if (signInRes.data.status !== "success") {
				throw new Error("Internal server error");
			}

			console.log(signInRes, "signInRes");

			form.reset();

			router.push("/dashboard");
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.log("Error while signin:", error.message);
			} else {
				console.log("Unexpected error while signin:", error);
			}
		}
	};

	return (
		<div>
			<h1>SignUp for Paapay Trade</h1>
			<form onSubmit={handleSignin}>

				<label htmlFor="email">Email</label>
				<input type="text" name="email" id="email" />

				<label htmlFor="password">Password</label>
				<input type="password" name="password" id="password" />

				<button type="submit">Signin</button>
			</form>
		</div>
	);
}
