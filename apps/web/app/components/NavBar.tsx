

import { Button } from "@/components/ui/button";
import Link from "next/link";

function NavBar() {
   return (
			<div className="flex items-center justify-between px-10 py-6 border-1 border-gray-600 ">
				<h1 className="text-3xl font-bold">Paapay Trade</h1>
				<div className="flex gap-4">
					<Button asChild className="px-6 py-5">
						<Link href={"/auth/signup"}>Sign Up</Link>
					</Button>
					<Button asChild className="px-6 py-5">
						<Link href={"/auth/signin"}>Sign In</Link>
					</Button>
				</div>
			</div>
		);
}

export default NavBar;