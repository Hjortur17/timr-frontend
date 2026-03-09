"use client";

import type { User } from "@/types/forms";
import { authHeaders, clearToken, getToken } from "@/utils/auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

interface UserContextValue {
	user: User;
	setUser: (user: User) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function useUser(): UserContextValue {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error("useUser must be used within a UserProvider");
	return ctx;
}

export function UserProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = getToken();
		if (!token) {
			router.replace("/login");
			return;
		}

		axios
			.get("/api/auth/user", { headers: authHeaders() })
			.then((res) => setUser(res.data.data))
			.catch(() => {
				clearToken();
				router.replace("/login");
			})
			.finally(() => setLoading(false));
	}, [router]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-neutral-500">Hleð...</p>
			</div>
		);
	}

	if (!user) return null;

	return (
		<UserContext.Provider value={{ user, setUser }}>
			{children}
		</UserContext.Provider>
	);
}
