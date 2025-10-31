"use client";
import React from "react";
import {
	useReactTable,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
} from "@tanstack/react-table";

type Person = {
	firstName: string;
	lastName: string;
	age: number;
};

const data: Person[] = [
	{ firstName: "Sumit", lastName: "Kumar", age: 23 },
	{ firstName: "Riya", lastName: "Sharma", age: 25 },
];

const columnHelper = createColumnHelper<Person>();

const columns = [
	columnHelper.accessor("firstName", {
		header: "First Name",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("lastName", {
		header: "Last Name",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("age", {
		header: "Age",
		cell: (info) => <i>{info.getValue()}</i>,
	}),
	columnHelper.display({
		id: "actions",
		header: "Actions",
		cell: (props) => (
			<button
				onClick={() => alert(`User: ${props.row.original.firstName}`)}
				className="px-2 py-1 bg-blue-500 text-white rounded"
			>
				View
			</button>
		),
	}),
];

export default function TableExample() {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<table className="border-collapse border border-gray-300 ">
			<thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<th key={header.id} className="border border-gray-300 p-2 text-xl">
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
							<td key={cell.id} className="border border-gray-300 p-2">
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}
