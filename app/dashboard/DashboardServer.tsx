// app/dashboard/DashboardServer.tsx
import GameLibrary from "@/components/server/gamelist-server";
import { auth } from '@/auth';

const DashboardServer = async () => {
    const session = await auth();
    if (!session || !session.user) return null

    return (
        <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
            <GameLibrary />
        </div>
    );
};

export default DashboardServer;
