import GameLibrary from "@/components/server/gamelist-server";

export default async function Page() {

  return (
    <div className="grid grid-rows-[1fr] items-center justify-items-center min-h-screen p-8 pb-10 gap-0 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <GameLibrary />
      </main >
    </div >
  );
}
