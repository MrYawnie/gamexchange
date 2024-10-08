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

export interface Game {
    gameId: string;
    game: GameData;
}

export interface GameListProps {
    games: Game[];
    errorMessage: string | null; // Accept errorMessage prop
}