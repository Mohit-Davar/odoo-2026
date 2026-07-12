"use client";
import Link from "next/link";
import { useAuthStore } from "../../store/authstore";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Next.js Auth with Zustand</h1>
      {user ? (
        <Link href="/dashboard">Go to Dashboard</Link>
      ) : (
        <>
          <Link href="/login">Login</Link> |{" "}
          <Link href="/signup">Register</Link>
        </>
      )}
    </div>
  );
}
