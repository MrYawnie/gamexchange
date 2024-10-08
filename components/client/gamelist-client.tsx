"use client"; // Mark this as a Client Component

import React, { useState } from 'react';
import GameCard from '../game-card';
import { useRouter } from 'next/navigation';

interface Game {
    gameId: string;
    game: {
        name: string;
    };
}

interface GameListProps {
    games: Game[];
}

export default function GameList({ games }: GameListProps) {
    const [retryMessage, setRetryMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const refetchGames = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/user/bgg/collection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: 'dummy' }), // Pass the necessary data if needed
            });

            if (response.status === 202) {
                setRetryMessage('BGG API is processing. Retry will happen automatically after 5 minutes.');
                // Optionally implement auto retry logic on client side, but this example assumes server-side retry handling.
            } else if (response.status === 200) {
                setRetryMessage('Games re-fetched successfully.');
                // You can manually trigger a revalidation of the data here (if necessary)
                router.refresh();
            } else {
                const errorData = await response.json();
                setRetryMessage(`Error: ${errorData.error}`);
            }
        } catch (error) {
            setRetryMessage('Failed to fetch games. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Game Library</h1>
            <button onClick={refetchGames} style={{ marginBottom: '16px' }} disabled={isLoading}>
                {isLoading ? 'Refreshing Games...' : 'Refresh Games'}
            </button>
            {retryMessage && <p>{retryMessage}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {games.length > 0 ? (
                    games.map((userGame) => (
                        <GameCard key={userGame.gameId} game={userGame.game} /> // Use GameCard component
                    ))
                ) : (
                    <p>No games found.</p>
                )}
            </div>
        </div>
    );
}
