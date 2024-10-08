import { prisma } from '@/prisma';
import { auth } from '@/auth';
import GameList from '../client/gamelist-client'; // Client component

export default async function GameLibrary() {
    const session = await auth();
    if (!session || !session.user) return <p>You are not logged in.</p>;

    // Fetch user and games
    const userWithGames = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        include: {
            games: {
                include: {
                    game: true, // Include game data
                },
            },
        },
    });

    // Pass the games data to the client component
    return <GameList games={userWithGames?.games || []} />;
}
