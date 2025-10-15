

export default function Dashboard({ isAdmin=false }) {
	return (
		<div>
			<h1>Dashboard</h1>
			{isAdmin ? (
				<div>Welcome to Admin Panel</div>
			) : (
				<div>Welcome, User!</div>
			)}{" "}
		</div>
	);
}
