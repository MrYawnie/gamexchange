import { auth } from "@/auth";
import BGGLoginDialog from "@/components/bgg-login";

export default async function Page() {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Pass the user's email to the BGGLogin component */}
      <BGGLoginDialog userEmail={session.user.email} />
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
