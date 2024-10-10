"use client"; // Mark this as a Client Component

import React, { useState } from 'react';
import GameCard from '../game-card';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { GameListProps } from '@/types/gameTypes';

export default function GameList({ games, errorMessage, bggUserId }: GameListProps) {
    const [retryMessage, setRetryMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const refetchGames = async () => {
        setIsLoading(true);
        setRetryMessage(null); // Reset the retry message on refetch
        try {
            const response = await fetch('/api/user/bgg/collection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: bggUserId }), // Pass the necessary data if needed
            });

            if (response.status === 202) {
                setRetryMessage('BGG API is processing. Retry will happen automatically after 5 minutes.');
            } else if (response.status === 200) {
                setRetryMessage('Games re-fetched successfully.');
                router.refresh(); // Trigger a revalidation of the data
            } else {
                const errorData = await response.json();
                setRetryMessage(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error fetching games:', error);
            setRetryMessage('Failed to fetch games. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-center mb-4 text-2xl">Personal Game Library</h1>
            <Button onClick={refetchGames} style={{ marginBottom: '16px' }} disabled={isLoading}>
                {isLoading ? 'Refreshing Games...' : 'Refresh Games'}
            </Button>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>} {/* Display error message here */}
            {retryMessage && <p className="text-red-500">{retryMessage}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {games.length > 0 ? (
                    games.map((userGame) => (
                        <GameCard key={userGame.game.gameId} game={userGame.game} />
                    ))
                ) : (
                    <p>No games found.</p>
                )}
            </div>
        </div>
    );
}
