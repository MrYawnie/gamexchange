import { NextResponse } from 'next/server';
import axios from 'axios';
import xml2js from 'xml2js';
import { prisma } from '@/prisma';

export async function POST(req: Request) {
    const { username } = await req.json(); // Extract username from the request body

    if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const url = `https://boardgamegeek.com/xmlapi2/collection?username=${username}`;

    try {
        const response = await axios.get(url);
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(response.data);
        const items = result.items.item;

        for (const item of items) {
            const gameId = item.$.objectid;
            const gameData = {
                id: gameId,
                name: item.name[0]._,
                yearPublished: item.yearpublished?.[0] || null,
                image: item.image?.[0] || null,
                thumbnail: item.thumbnail?.[0] || null,
                stats: {
                    minPlayers: item.stats[0].$.minplayers || null,
                    minPlaytime: item.stats[0].$.minplaytime || null,
                    maxPlaytime: item.stats[0].$.maxplaytime || null,
                    playingTime: item.stats[0].$.playingtime || null
                },
                ratings: {
                    usersRated: item.stats[0].rating[0].usersrated?.[0]?.$.value || null,
                    average: item.stats[0].rating[0].average?.[0]?.$.value || null,
                    bayesAverage: item.stats[0].rating[0].bayesaverage?.[0]?.$.value || null,
                    stddev: item.stats[0].rating[0].stddev?.[0]?.$.value || null,
                    median: item.stats[0].rating[0].median?.[0]?.$.value || null,
                }
            };

            // Check if the game exists in the GameData collection
            const existingGame = await prisma.gameData.findUnique({
                where: { id: gameId },
            });

            if (!existingGame) {
                // Insert new game into the GameData collection if it doesn't exist
                await prisma.gameData.create({
                    data: gameData
                });
            }

            // Link the game to the user in the UserGame collection
            const existingUserGame = await prisma.userGame.findUnique({
                where: {
                    userId_gameId: {
                        userId: username,  // Adjust this if you use a different field for username
                        gameId: gameId
                    }
                }
            });

            if (!existingUserGame) {
                await prisma.userGame.create({
                    data: {
                        user: { connect: { bggUserName: username } }, // Assuming you're using bggUserName
                        game: { connect: { id: gameId } }
                    }
                });
            }
        }

        return NextResponse.json({ message: 'Games fetched and saved successfully.' }, { status: 200 });
        
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        return NextResponse.json({ error: 'Failed to fetch data.' }, { status: 500 });
    }
}
