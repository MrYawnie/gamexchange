import { prisma } from '@/prisma';
import { auth } from '@/auth';
import GameList from '../app/my-collection/GameListCardClient'; // Client component

export default async function GameLibrary() {
    const session = await auth();
    if (!session || !session.user) return <GameList games={[]} errorMessage="You are not logged in." currentUserId={''} bggUserId={''} />;

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
        return <GameList games={[]} errorMessage="Failed to load your games. Please try again later." currentUserId={session.user.id || ''} bggUserId={session.user.bggUserName || ''} />;
    }

    if (!userWithGames) {
        return <GameList games={[]} errorMessage="No games found for your account." currentUserId={session.user.id || ''} bggUserId={session.user.bggUserName || ''} />;
    }

    // Pass the games data to the client component
    const games = (userWithGames.games || []).map(game => ({
        ...game,
        game: {
            ...game.game,
            yearPublished: game.game.yearPublished ?? 0, // Provide a default value for yearPublished
        },
        count: 0,
        availableCount: 0,
        loanedCount: 0,
    }));

    return <GameList games={games} errorMessage={null} currentUserId={session.user.id || ''} bggUserId={session.user.bggUserName || ''} />;
}
