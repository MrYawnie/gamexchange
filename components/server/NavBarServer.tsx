// Server-side component for fetching the user
import { auth } from "@/auth";
import NavBarClient from '../client/NavBarClient'; // separate client-side navbar logic

export default async function NavBarServer() {
  const session = await auth();
    if (!session || !session.user) return null;
    console.log(session.user);

  return <NavBarClient user={session.user || null} />;
}
