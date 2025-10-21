"use client";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Signup() {
	const router = useRouter(); 

	const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;

		try {
			const formData = new FormData(form);

			const username = formData.get("name")?.toString();
			const email = formData.get("email")?.toString();
			const password = formData.get("password")?.toString();

			if (!username || !email || !password) {
				throw new Error("Required fields are missing");
			}

			const signupRes = await axios.post(
				"http://localhost:3001/api/auth/signup",
				{ name: username, email, password }
			);

			if (signupRes.data.status !== "success") {
				throw new Error("Internal server error");
			}

			console.log(signupRes, "signupRes");

			form.reset();

		
			router.push("/auth/signin"); 
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.log("Error while signup:", error.message);
			} else {
				console.log("Unexpected error while signup:", error);
			}
		}
	};

	return (
		<div>
			<h1>SignUp for Paapay Trade</h1>
			<form onSubmit={handleSignup}>
				<label htmlFor="name">Username</label>
				<input type="text" name="name" id="name" />

				<label htmlFor="email">Email</label>
				<input type="text" name="email" id="email" />

				<label htmlFor="password">Password</label>
				<input type="password" name="password" id="password" />

				<button type="submit">Signup</button>
			</form>
		</div>
	);
}
