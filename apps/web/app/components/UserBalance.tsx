"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";

export default function UserBalance() {
	const [balance, setBalance] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);


	const fetchBalance = async () => {
		try {
			const res = await axios.get("http://localhost:3001/api/user/getbalance", {
				withCredentials: true,
			});
			setBalance(res.data.data.walletBalance);
		} catch (err) {
         console.log("error while fetching balance",err);
			setError("Failed to fetch balance");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBalance();
	}, []);


	const handleAddMoney = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);
		const deposit = formData.get("deposit");

		try {
			await axios.post(
				"http://localhost:3001/api/user/walletdeposit",
				{ amount: deposit?.toString() },
				{ withCredentials: true }
			);

			await fetchBalance();
			form.reset();
		} catch (err) {
			console.log("Error while adding money:", err);
		}
	};

	return (
		<div className="flex space-x-2 items-center">
			{loading ? (
				<p>Loading balance...</p>
			) : error ? (
				<p style={{ color: "red" }}>{error}</p>
			) : (
				<p>Balance: $ {balance ?? 0}</p>
			)}

			<form onSubmit={handleAddMoney} className="border-2">
				<label htmlFor="deposit">Add Money:</label>
            <br />
				<input type="number" id="deposit" name="deposit" className="border-1" />
            <br />
				<button type="submit" className="">Add</button>
			</form>
		</div>
	);
}
