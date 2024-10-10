import { User } from "@prisma/client";

// Game data structure based on BoardGameGeek or similar API
export interface GameData {
    gameId: string;
    objectType: 'boardgame' | 'boardgameexpansion';
    name: string;
    yearPublished: number | null;
    image: string;
    thumbnail: string;
    stats: {
        minPlayers: number | null;
        minPlaytime: number | null;
        maxPlaytime: number | null;
        playingTime: number | null;
    };
    ratings: {
        usersRated: number | null;
        average: number | null;
        bayesAverage: number | null;
        stddev: number | null;
        median: number | null;
    };
}

// Represents each game instance in the group, with count of duplicates and owners
export interface GroupGame {
    game: GameData;
    count?: number; // Number of copies owned within the group
    owners?: User[]; // List of users who own this game
    isLoaned?: boolean; // Indicates if the game is loaned out
}

// Props for a component that displays a list of games
export interface GameListProps {
    games: GroupGame[]; // Updated to use GroupGame instead of Game
    errorMessage: string | null; // To display any error messages
    bggUserId?: string;
    currentUserId?: string; // Current user ID
    /* onToggleLoan: (gameId: string) => void; // Function to handle loan toggle */
}
