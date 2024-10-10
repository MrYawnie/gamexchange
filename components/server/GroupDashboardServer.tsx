// app/GroupDashboard.tsx (Server Component)
import { GroupDashboardClient } from '../client/GroupDashboardClient';
import { prisma } from '@/prisma'; // Adjust this import according to your project structure
import { auth } from '@/auth';
import { GroupGame } from '../../types/gameTypes'; // Importing the GroupGame type

interface GroupDashboardProps {
    groupId: string;
    groupGames?: GroupGame[]; // Use GroupGame[] for groupGames
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

    // Fetch users in the group
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
            user: true, // Include user details (from User)
        }
    });

    // Group the games by gameId, including the owners of the game
    const groupedGames = groupGames.reduce((acc: { [key: string]: GroupGame }, userGame) => {
        const gameId = userGame.gameId;
    
        if (!acc[gameId]) {
            acc[gameId] = {
                game: userGame.game, // Game details from GameData
                owners: [userGame.user], // Initialize owners array with the first owner
                count: 1, // Initialize count to 1
                isLoaned: false, // Default value; adjust based on loan status
            };
        } else {
            // Ensure count and owners are defined before accessing them
            if (acc[gameId]) {
                acc[gameId].count = (acc[gameId].count ?? 0) + 1; // Increment count safely
                acc[gameId].owners = acc[gameId].owners || []; // Ensure owners is an array
                acc[gameId].owners.push(userGame.user); // Add the owner to the owners array
            }
        }
    
        return acc;
    }, {});
    

    // Convert the result to an array for easier rendering
    const gamesList: GroupGame[] = Object.values(groupedGames);

    // Fetch messages for the specified group
    const messages = await prisma.message.findMany({
        where: { groupId },
        include: { user: true }, // Include user info for messages
    });

    // Format the messages to include necessary fields
    const formattedMessages = messages.map(msg => ({
        id: msg.id,
        userId: msg.userId,
        groupId: msg.groupId,
        content: msg.content,
        timestamp: msg.timestamp,
        user: {
            id: msg.user.id,
            name: msg.user.name,
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
