"use client";

import axios from "axios";
import useOrder from "../store/useOrder";

import { OrderTypeProp } from "../store/useOrder";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { formatNumber, formatTime } from "./CloseOrder";


const columnHelper = createColumnHelper<OrderTypeProp>();

const closedOrder = async (orderId: string) => {

	try {
		console.log("closed Order function is called");
		const closeOrderResponse = await axios.post(
			"http://localhost:3001/api/order/closeorder",
			{ id: orderId },
			{ withCredentials: true }
		);
      

		console.log("closeOrderResponse", closeOrderResponse);
	} catch (error) {
		console.log("error in closing the order", error);
	}
};

const columns = [
	columnHelper.accessor("id", {
		header: "Order Id",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("position", {
		header: "Position",
		cell: (info) => info.getValue(),
	}),

	columnHelper.accessor("quantity", {
		header: "Quantity",
		cell: (info) => formatNumber(info.getValue()),
	}),
	columnHelper.display({
		id: "capitalInvested",
		header: "Capital Invested",
		cell: (info) => {
			const row = info.row.original;
			const quantity = Number(row.quantity) || 0;
			const entryPrice = Number(row.entryPrice) || 0;
			const invested = quantity * entryPrice;
			return formatNumber(invested.toString());
		},
	}),
	columnHelper.accessor("entryPrice", {
		header: "Entry Price",
		cell: (info) => formatNumber(info.getValue()),
	}),
	columnHelper.accessor("pnl", {
		header: "P&L",
		cell: (info) => {
			const value = info.getValue<string | null>();
			return value == null ? "Null" : formatNumber(value);
		},
	}),
	columnHelper.accessor("takeProfit", {
		header: "Take Profit",
		cell: (info) => {
			const value = info.getValue<string | null>();
			return value == null ? "Null" : formatNumber(value);
		},
	}),
	columnHelper.accessor("stopLoss", {
		header: " Stop Loss",
		cell: (info) => {
			const value = info.getValue<string | null>();
			return value == null ? "Null" : formatNumber(value);
		},
	}),

	columnHelper.accessor("closingReason", {
		header: " Closing Type ",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("orderCreatedAt", {
		header: "Creation Time",
		cell: (info) => formatTime(info.getValue()),
	}),
	columnHelper.display({
		id: "action",
		header: "Close Position",
		cell: (info) => (
			<Button
				onClick={() => closedOrder(info.row.original.id)}
				className="text-lg"
			>
				Exit
			</Button>
		),
	}),
];

export default  function OpenOrder() {
	const orderDetail = useOrder((state) => state.orderDetails);

	const data: OrderTypeProp[] = useMemo(() => {
		return Array.from(orderDetail.values());
	}, [orderDetail]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<>
			{data && data.length > 0 ? (
				<table className="border-collapse border border-gray-300 w-full ">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="border border-gray-300 p-2 text-xl"
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									</th>
								))}
							</tr>
						))}
					</thead>

					<tbody>
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className={`border border-gray-300 p-2`}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<h1 className="text-2xl ">NO Current Open Orders</h1>
			)}
		</>
	);
}


