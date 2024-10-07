import { auth } from "@/auth";
import BGGLoginDialog from "@/components/bgg-login";
import { SignIn } from "@/components/sign-in";
import { SignOut } from "@/components/signout-button";
import UserAvatar from "@/components/user-avatar";

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) return <div>Not authenticated</div>;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1>Dashboard</h1>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <SignIn />
          <SignOut />
            {!session.user.bggUserName ? (
            <BGGLoginDialog />
            ) : (
            <span><b>BGG user:</b> {session.user.bggUserName}</span>
            )}
        </div>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <UserAvatar />
          {/* <BGGUser /> */}
        </div>
      </main>
    </div>
  );
}
