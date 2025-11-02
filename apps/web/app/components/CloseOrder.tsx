"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import  {OrderTypeProp} from "../store/useOrder"
import {
	useReactTable,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
} from "@tanstack/react-table";

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";




// closingReason: "Automatic";
// entryPrice: "110007.37";
// exitPrice: "110016.56";
// id: 86;
// orderClosedAt: "2025-10-30T11:29:23.117Z";
// orderCreatedAt: "2025-10-30T11:29:14.401Z";
// pnl: "9.190000000002328";
// position: "Long";
// quantity: "1";
// status: "Closed";
// stopLoss: null;
// takeProfit: null;
// type: "Market";
// updatedAt: "2025-10-30T11:29:23.119Z";
// userId: "347db88f-e402-4056-84a3-10b95502dc47";



type ClosedOrderDetailsType = Omit<OrderTypeProp, "id" | "amount" > & {
	id: number;
};

export const formatNumber=(badData:string):string=> (Math.trunc((Number(badData)*100))/100).toFixed(2);

export const formatTime=(date:string):string=>{
	const dateData=new Date(date);
const datee=(dateData.toISOString().split("T"));
const istTime = dateData.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
return `${istTime} ${datee[0]}`;
}


const columnHelper=createColumnHelper<ClosedOrderDetailsType>();


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
	columnHelper.accessor("entryPrice", {
		header: "Entry Price",
		cell: (info) => formatNumber(info.getValue()),
	}),
	columnHelper.accessor("pnl", {
		header: "P&L",
		cell: (info) => {
			const value = info.getValue<null | undefined | string>();
			return value == null ? "Null" : formatNumber(value);
		},
	}),
	columnHelper.accessor("takeProfit", {
		header: "Take Profit",
		cell: (info) => {
			const value = info.getValue<null | undefined | string>();
			return value == null ? "Null" : formatNumber(value);
		},
	}),
	columnHelper.accessor("stopLoss", {
		header: " Stop Loss",
		cell: (info) => {
			const value = info.getValue<null | undefined | string>();
			return value == null ? "Null" : formatNumber(value);
		},
	}),
	columnHelper.accessor("exitPrice", {
		header: " Exit Price",
		cell: (info) => {
			const value = info.getValue<null | undefined | string>();
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
	columnHelper.accessor("orderClosedAt", {
		header: "Closing Time",
		cell: (info) => {
			const value= info.getValue<null|string>();
			return value ==null ? "NUll" : formatTime(value);
		},
	}),
];



function ClosedOrder() {

   const [loading,setLoading]=useState(true);
   const [data,setClosedOrderData]=useState<ClosedOrderDetailsType[]>([]);
   const [error,setError]=useState<string|null>(null);
	const [page,setPage]=useState<number>(1);
   const table = useReactTable({
         data,
         columns,
         getCoreRowModel: getCoreRowModel(),
      });


	 

   useEffect(()=>{
		async function fetchCloseOrder() {
			try {
				const fetchClosedOrderData = await axios.get(
					`http://localhost:3001/api/order/orderhistory?page=${page}`,
					{
						withCredentials: true,
					}
				);
				setLoading(false);
				console.log("closedOrderData", fetchClosedOrderData.data);

				if (fetchClosedOrderData.data.status === "success") {
					setClosedOrderData(fetchClosedOrderData.data.data);
				}
			} catch (error) {
				console.log("error in the fetching the order ", error);
				setError(JSON.stringify(error));
			}
		}
      fetchCloseOrder()
   },[page])

   if(loading){
      return <div>Loading...</div>
   }
   if (error) {
			return <div>Error while fetching the details {error}</div>;
		}



   return (
			<>
				<div className="">
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
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
					{/* for pagination */}
					<Pagination className="pt-4" >
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href="#"
									onClick={() => {
										setPage((e) => (e > 1 ? e - 1 : e));
									
									}}
								/>
							</PaginationItem>
							{page > 1 ? (
								<PaginationItem>
									<PaginationLink href="#">
										{page > 1 ? page - 1 : null}
									</PaginationLink>
								</PaginationItem>
							) : null}

							<PaginationItem>
								<PaginationLink href="#" isActive>
									{page}
								</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#">{page + 1}</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
							<PaginationItem>
								<PaginationNext
									href="#"
									onClick={() => {
										setPage((e) => (data.length ===5 ? e+1: e));
									}}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</>
		);
}

export default ClosedOrder;