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
    id: string;
    game: GameData;
    count?: number; // Number of copies owned within the group
    availableCount?: number; // Number of available copies
    loanedCount?: number; // Number of loaned copies
    owners?: User[]; // List of users who own this game
    isLoaned?: boolean; // Indicates if the game is loaned out
    user: User;
    loans?: Loan[];
    userGames: {
        userGameId: string;
        user: User;
        isLoaned: boolean;
    }[];
}

export interface UserGame {
    [x: string]: any;
    userId: string;
    gameId: string;
    isLoaned: boolean;
    loanedTo?: string;
    loanedToUser?: User;
    loanedDate?: Date;
    returnDate?: Date;
    game: GameData;
    user: User;
    loans?: Loan[];
}

export interface Loan {
    id: string;
    userGameId: string;
    lenderId: string;
    borrowerId: string;
    startDate: Date;
    endDate?: Date;
    userGame: UserGame;
    lender: User;
    borrower: User;
}

// Props for a component that displays a list of games
export interface GameListProps {
    games: GroupGame[]; // Updated to use GroupGame instead of Game
    errorMessage: string | null; // To display any error messages
    bggUserId?: string;
    currentUserId?: string; // Current user ID
    groupId: string; // Group ID
    users?: User[]; // List of users in the group
    /* onToggleLoan: (gameId: string) => void; // Function to handle loan toggle */
}

export interface UserProps {
    user: Partial<User>;
}

export interface LoanGameActionProps {
    game: UserGame; // GroupGame interface includes game details, loan status, etc.
    users: User[]; // List of users in the group
    groupId: string; // The current group ID
    currentUserId: string; // ID of the current logged-in user
    userGameId: string; // The specific user's game instance ID
}