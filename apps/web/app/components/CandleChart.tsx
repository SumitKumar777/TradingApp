"use client";

import { useEffect, useRef } from "react";
import axios from "axios";
import { createChart ,CandlestickSeries} from "lightweight-charts";

export default function CandleChart() {
	const chartContainerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const fetchAndRenderChart = async () => {
			try {
				// Fetch data
				const res = await axios.get(
					"http://localhost:3001/api/chart/candles/5"
				);
				const data = res.data.data;
				console.log(data, "candlestick data");

				// Initialize chart
          
				const chart = createChart(chartContainerRef.current!, {
					layout: {
						textColor: "white",
						background: { type: "solid", color: "black" },
					},
					width: chartContainerRef.current!.clientWidth,
					height: 400,
				});

				// Add candlestick series
				const candlestickSeries = chart.addSeries(CandlestickSeries, {
					upColor: "#26a69a",
					downColor: "#ef5350",
					borderVisible: false,
					wickUpColor: "#26a69a",
					wickDownColor: "#ef5350",
				});
				candlestickSeries.setData(data);
				chart.timeScale().fitContent();

				// Resize chart dynamically
				const handleResize = () => {
					chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
				};
				window.addEventListener("resize", handleResize);

				return () => {
					window.removeEventListener("resize", handleResize);
					chart.remove();
				};
			} catch (error) {
				console.error("Error fetching chart data:", error);
			}
		};

		fetchAndRenderChart();
	}, []);

	return (
		<div>
			<h2 style={{ color: "white" }}>Candle Chart</h2>
			<div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />
		</div>
	);
}
