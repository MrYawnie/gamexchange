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
                gameId: gameId,
                name: item.name[0]._,
                yearPublished: item.yearpublished?.[0] ? parseInt(item.yearpublished[0], 10) : null,
                image: item.image?.[0] || null,
                thumbnail: item.thumbnail?.[0] || null,
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

            // Check if the game exists in the GameData collection
            await prisma.gameData.upsert({
                where: { gameId: gameData.gameId },
                create: gameData,
                update: gameData
            });

            // Fetch the user by bggUserName
            const user = await prisma.user.findUnique({
                where: { bggUserName: username }
            });

            const game = await prisma.gameData.findUnique({
                where: { gameId: gameId }
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
                            user: { connect: { bggUserName: username } }, // Assuming you're using bggUserName
                            game: { connect: { gameId: gameId } }
                        }
                    });
                }
            }

            // return NextResponse.json({ message: 'Games fetched and saved successfully.' }, { status: 200 });

        }
        return NextResponse.json({ message: 'Games fetched and saved successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        return NextResponse.json({ error: 'Failed to fetch data.' }, { status: 500 });
    }
}
