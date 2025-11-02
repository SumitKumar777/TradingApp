"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { Button } from "@/components/ui/button";

export default function CandleChart({className}:{className:string}) {
	const chartContainerRef = useRef<HTMLDivElement | null>(null);
	const chartRef = useRef<any>(null); 
	const [interval, setInterval] = useState(5);

	useEffect(() => {
		let chart: any;

		const fetchAndRenderChart = async () => {
			try {
				const res = await axios.get(
					`http://localhost:3001/api/chart/candles/${interval}`
				);
				const data = res.data.data;


				if (chartRef.current) {
					chartRef.current.remove();
				}

				chart = createChart(chartContainerRef.current!, {
					layout: {
						textColor: "white",
						// @ts-ignore
						background: { type: "solid", color: "black" },
					},
					width: chartContainerRef.current!.clientWidth,
					height: 400,
				});

				chartRef.current = chart; 

				const candlestickSeries = chart.addSeries(CandlestickSeries, {
					upColor: "#26a69a",
					downColor: "#ef5350",
					borderVisible: false,
					wickUpColor: "#26a69a",
					wickDownColor: "#ef5350",
				});
				candlestickSeries.setData(data);
				chart.timeScale().fitContent();

				const handleResize = () => {
					chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
				};
				window.addEventListener("resize", handleResize);


				return () => {
					window.removeEventListener("resize", handleResize);
				};
			} catch (error) {
				console.error("Error fetching chart data:", error);
			}
		};

		fetchAndRenderChart();


		return () => {
			if (chartRef.current) {
				chartRef.current.remove();
				chartRef.current = null;
			}
		};
	}, [interval]);

	return (
		<div className={className}>
			<div className="py-2">
				<h1>Chart  Interval</h1>
				<div className="flex space-x-2 mt-2">
					<Button
						className={`${interval === 5 ? "bg-gray-700" : "bg-gray-500"} `}
						onClick={() => setInterval(5)}
					>
						5 min
					</Button>
					<Button
						className={`${interval === 15 ? "bg-gray-700" : "bg-gray-500"}`}
						onClick={() => setInterval(15)}
					>
						15 min
					</Button>
				</div>
			</div>
			<div
				ref={chartContainerRef}
				className="w-full h-[400px] border-1 rounded-xl"
			/>
		</div>
	);
}
