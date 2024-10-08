import { NextResponse } from 'next/server';
import axios from 'axios';
import xml2js from 'xml2js';
import { prisma } from '@/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    const sessionUser = session?.user;
    const { username } = await req.json(); // Extract username from the request body

    if (!sessionUser) {
        return NextResponse.json({ error: 'User session not found' }, { status: 401 });
    }

    if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // URLs for both board games and expansions
    const boardGamesUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${sessionUser.bggUserName}&stats=1&excludesubtype=boardgameexpansion`;
    const expansionsUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${sessionUser.bggUserName}&stats=1&subtype=boardgameexpansion`;

    try {
        // Fetch data for board games
        const boardGamesResponse = await axios.get(boardGamesUrl);
        if (boardGamesResponse.status === 202) {
            return NextResponse.json({ message: 'BGG API is processing. Retry in a few minutes.' }, { status: 202 });
        }
        const boardGamesData = await parseXML(boardGamesResponse.data);

        // Fetch data for expansions
        const expansionsResponse = await axios.get(expansionsUrl);
        if (expansionsResponse.status === 202) {
            return NextResponse.json({ message: 'BGG API is processing. Retry in a few minutes.' }, { status: 202 });
        }
        const expansionsData = await parseXML(expansionsResponse.data);

        // Combine both board games and expansions
        const combinedItems = [...boardGamesData.items.item, ...expansionsData.items.item];

        for (const item of combinedItems) {
            const gameId = item.$.objectid;
            const objectType = item.$.subtype;

            const gameData = {
                gameId: gameId,
                objectType: objectType,
                name: item.name[0]._,
                yearPublished: item.yearpublished?.[0] ? parseInt(item.yearpublished[0], 10) : null,
                image: item.image?.[0],
                thumbnail: item.thumbnail?.[0],
                stats: {
                    minPlayers: item.stats[0].$.minplayers ? parseInt(item.stats[0].$.minplayers, 10) : null,
                    minPlaytime: item.stats[0].$.minplaytime ? parseInt(item.stats[0].$.minplaytime, 10) : null,
                    maxPlaytime: item.stats[0].$.maxplaytime ? parseInt(item.stats[0].$.maxplaytime, 10) : null,
                    playingTime: item.stats[0].$.playingtime ? parseInt(item.stats[0].$.playingtime, 10) : null
                },
                ratings: {
                    usersRated: item.stats[0].rating[0].usersrated?.[0]?.$.value ? parseInt(item.stats[0].rating[0].usersrated[0].$.value, 10) : null,
                    average: item.stats[0].rating[0].average?.[0]?.$.value ? parseFloat(item.stats[0].rating[0].average[0].$.value) : null,
                    bayesAverage: item.stats[0].rating[0].bayesaverage?.[0]?.$.value ? parseFloat(item.stats[0].rating[0].bayesaverage[0].$.value) : null,
                    stddev: item.stats[0].rating[0].stddev?.[0]?.$.value ? parseFloat(item.stats[0].rating[0].stddev[0].$.value) : null,
                    median: item.stats[0].rating[0].median?.[0]?.$.value ? parseFloat(item.stats[0].rating[0].median[0].$.value) : null,
                }
            };

            // Upsert game data in the GameData collection
            const game = await prisma.gameData.upsert({
                where: { gameId: gameData.gameId },
                create: gameData,
                update: gameData
            });

            // Fetch the user by bggUserName
            const user = await prisma.user.findUnique({
                where: { id: sessionUser.id }
            });

            if (user && game) {
                // Check if the game exists in the UserGame collection
                const existingUserGame = await prisma.userGame.findUnique({
                    where: {
                        userId_gameId: {
                            userId: user.id,  // Use the user's ObjectId
                            gameId: game.id     // This should be the gameId (ObjectId)
                        }
                    }
                });

                if (!existingUserGame) {
                    await prisma.userGame.create({
                        data: {
                            user: { connect: { id: user.id } }, // Assuming you're using bggUserName
                            game: { connect: { id: game.id } }
                        }
                    });
                }
            }
        }

        return NextResponse.json({ message: 'Games and expansions fetched and saved successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        return NextResponse.json({ error: 'Failed to fetch data.' }, { status: 500 });
    }
}

// Helper function to parse XML
async function parseXML(xmlData: string) {
    const parser = new xml2js.Parser();
    return await parser.parseStringPromise(xmlData);
}
