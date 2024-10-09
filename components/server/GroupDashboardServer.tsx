// app/GroupDashboard.tsx (Server Component)
import { GroupDashboardClient } from '../client/GroupDashboardClient';
import { prisma } from '@/prisma'; // Adjust this import according to your project structure
import { auth } from '@/auth';

interface GroupDashboardProps {
    groupId: string;
    groupGames: any;
}

export default async function GroupDashboard({ groupId }: GroupDashboardProps) {
    const session = await auth();
    if (!session || !session.user) return null;

    const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { name: true },
    });
    const groupName = group ? group.name : 'Unknown Group';

    const userId = session.user.id ?? '';

    // Fetch users
    const users = await prisma.user.findMany({
        where: {
            userGroups: {
                some: {
                    groupId: groupId
                }
            }
        }
    }).then(users =>
        users.map(user => ({
            ...user,
            bggUserName: user.bggUserName ?? '',
        }))
    );

    // Fetch all games owned by group members
    const groupGames = await prisma.userGame.findMany({
        where: {
            user: {
                userGroups: {
                    some: {
                        groupId: groupId
                    }
                }
            }
        },
        include: {
            game: true, // Include game details (from GameData)
        }
    });

    // Group the games by gameId and count duplicates
    const groupedGames = groupGames.reduce((acc: { [key: string]: { game: any, count: number } }, userGame) => {
        const gameId = userGame.gameId;

        if (!acc[gameId]) {
            acc[gameId] = {
                game: userGame.game, // Game details
                count: 1,
            };
        } else {
            acc[gameId].count += 1;
        }

        return acc;
    }, {});

    // Convert the result to an array for easier rendering
    const gamesList = Object.values(groupedGames);

    console.log(gamesList);

    // Fetch messages for the specified group
    const messages = await prisma.message.findMany({
        where: { groupId }, // Ensure groupId is in the Message model
        include: { user: true }, // Include user info for messages
    });

    // Format the messages to include necessary fields
    const formattedMessages = messages.map(msg => ({
        id: msg.id,
        userId: msg.userId,
        groupId: msg.groupId, // Add groupId to the formatted message
        content: msg.content,
        timestamp: msg.timestamp,
        user: {
            id: msg.user.id,
            name: msg.user.name,
            // Add more user fields if necessary
        },
    }));

    return (
        <GroupDashboardClient
            users={users}
            messages={formattedMessages}
            groupId={groupId}
            groupName={groupName}
            currentUserId={userId}
            groupGames={gamesList}
        />
    );
}
