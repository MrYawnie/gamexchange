import { auth } from "@/auth";
import BGGLoginDialog from "@/components/bgg-login";
import GameLibrary from "@/components/server/gamelist-server";
import { SignIn } from "@/components/sign-in";
import { SignOut } from "@/components/signout-button";
import { BGGUser } from "@/components/user-avatar";

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) return null;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1>My Collection</h1>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <SignIn />
          <SignOut />
          {!session.user.bggUserName ? (
            <BGGLoginDialog />
          ) : (
            <BGGUser />
          )}
        </div>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <GameLibrary />
        </div>
      </main >
    </div >
  );
}
