// app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth"; // Import your Auth.js setup

export default async function HomePage() {
  const session = await auth(); // Check the user's session

  // If the user is authenticated, redirect to /dashboard
  if (session?.user) {
    redirect("/dashboard");
  }
}
