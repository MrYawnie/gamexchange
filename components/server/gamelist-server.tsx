import { prisma } from '@/prisma';
import { auth } from '@/auth';
import GameList from '../client/gamelist-client'; // Client component

export default async function GameLibrary() {
    const session = await auth();
    if (!session || !session.user) return <GameList games={[]} errorMessage="You are not logged in." />;

    // Fetch user and games
    let userWithGames;
    try {
        userWithGames = await prisma.user.findUnique({
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
    } catch (error) {
        console.error('Error fetching user with games:', error);
        return <GameList games={[]} errorMessage="Failed to load your games. Please try again later." />;
    }

    if (!userWithGames) {
        return <GameList games={[]} errorMessage="No games found for your account." />;
    }

    // Pass the games data to the client component
    return <GameList games={userWithGames.games || []} errorMessage={null} />;
}
