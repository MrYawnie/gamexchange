"use client"; // Mark this as a Client Component

import React, { useState } from 'react';
import Image from 'next/image';
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
            <h1 className="text-center mb-4 text-2xl">Game Library</h1>
            <Button onClick={refetchGames} style={{ marginBottom: '16px' }} disabled={isLoading}>
                {isLoading ? 'Refreshing Games...' : 'Refresh Games'}
            </Button>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>} {/* Display error message here */}
            {retryMessage && <p className="text-red-500">{retryMessage}</p>}
            <div className="">
                {games.length > 0 ? (
                    <ul className="space-y-2">

                        {games.map((game) => (
                            <li key={game.game.gameId} className="bg-muted p-2 rounded-md flex justify-between items-center">
                                <span>
                                    {game.game.name}
                                </span>
                                <Image src={game.game.thumbnail} alt={game.game.name} width={32} height={32} className="h-8 w-8" />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No games found.</p>
                )}
            </div>
        </div>
    );
}
