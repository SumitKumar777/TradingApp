"use client";
import { useEffect, useState } from "react";
import CandleChart from "../../components/CandleChart";
import axios from "axios";
import usePrice from "../../store/usePrice";

import StockPrice from "../../components/StockPrice";
import PlaceOrder from "../../components/PlaceOrder";
import OrderDetails from "../../components/OrderDetails";
import UserBalance, { fetchBalance } from "../../components/UserBalance";
import useOrder from "../../store/useOrder";
import { useUser } from "../../store/useUser";



function DashBoard() {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const setTokenPrice = usePrice((state) => state.setTokenPrice);
	const addOrder= useOrder((state)=>state.addOrder);
	const closeOrder=useOrder((state)=>state.closeOrder);
	const setBalance=useUser((state)=>state.setBalance);

	useEffect(() => {
		async function connectToWebsocket() {
			try {
				const token = (await axios.get("/api/getToken")).data.cookie;
				console.log(token, "token");
				if (!token) {
					throw new Error("Connection failed with websocket no cookie found");
				}

				const connection = new WebSocket(`ws://localhost:8080/?token=${token}`);

				connection.onopen = () => {
					console.log("connection established");
					setSocket(connection);
				};

				connection.onmessage = async(data) => {

					try {
						// parse the incoming message payload
						const parsedData = JSON.parse(data.data);
						// console.log(parsedData,"parsedData ")
						let parsedMessage;
						try {
							parsedMessage = JSON.parse(parsedData.message);
						} catch {

							parsedMessage = parsedData.message;
						}

						if (parsedData.type === "orderUpdate") {
							console.log(parsedData);

							addOrder(parsedData.order);


						} else if (parsedData.type === "chartData") {
							
							// console.log(parsedMessage.data.k);

						}else if (parsedData.type === "tokenPrice") {
							const formatedTokenPrice=(Math.trunc(parsedMessage.data.p *100)/100).toFixed(2);
							setTokenPrice(Number(formatedTokenPrice));

							
						}else if(parsedData.type==="orderClosed"){
							console.log("closedOrder in frontend",parsedData);
							const updatedBalance=await fetchBalance();
							const formattedBalance = (
								Math.trunc(updatedBalance * 100) / 100
							).toFixed(2);
							setBalance(Number(formattedBalance));
							closeOrder(parsedData.order.id);

						}
						else{
					 console.log(parsedData,"else block");
				  }

					} catch (error) {
						console.log(data, "data in the catch block", error);
					}
				};

				connection.onerror = (err) => {
					console.log("error in the websocket connection", err);
				};
			} catch (error) {
				console.log("error in connecting to websoket in dashboard", error);
			}
		}

		connectToWebsocket();
	}, []);

	return (
		<div className=" grid gap-2 px-6  pt-4 ">
			<div className="flex justify-between items-center border-1 py-2">
				<h1 className="text-xl font-semibold">Paapay trade </h1>
				<UserBalance />
			</div>
			<StockPrice />

			<div>
				<h1 className="text-xl">Candle Chart </h1>
				<div className="grid gap-4 md:grid-cols-3">
					<CandleChart className={"col-span-2 w-full"} />
					<PlaceOrder className={"md:px-4"}/>
				</div>
			</div>
			<OrderDetails />
		</div>
	);
}

export default DashBoard;
