"use client";
import { useEffect, useState } from "react";
import CandleChart from "../../components/CandleChart";
import axios from "axios";
import usePrice from "../../store/usePrice";

import StockPrice from "../../components/StockPrice";
import PlaceOrder from "../../components/PlaceOrder";
import OrderDetails from "../../components/OrderDetails";
import UserBalance from "../../components/UserBalance";
import useOrder from "../../store/useOrder";

function DashBoard() {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const setTokenPrice = usePrice((state) => state.setTokenPrice);
	const addOrder= useOrder((state)=>state.addOrder);

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

				connection.onmessage = (data) => {

					try {
						// parse the incoming message payload
						const parsedData = JSON.parse(data.data);
						console.log(parsedData,"parsedData ")
						let parsedMessage;
						try {
							parsedMessage = JSON.parse(parsedData.message);
						} catch {

							parsedMessage = parsedData.message;
						}

						if (parsedData.type === "orderUpdate") {
							console.log("orderUpdate",  parsedData.order );
							addOrder(parsedData.order);


						} else if (parsedData.type === "chartData") {
							console.log(parsedMessage.data.k);

						}else if (parsedData.type === "tokenPrice") {

							setTokenPrice(parsedMessage.data.p);
						}else{
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
		<div>
			<div className="flex justify-between px-3 items-center">
				<h1>Paapay trade </h1>
				<UserBalance />
			</div>
			<StockPrice />
			<CandleChart />
			<PlaceOrder />
			<OrderDetails />
		</div>
	);
}

export default DashBoard;
