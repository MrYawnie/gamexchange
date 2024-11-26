// app/GroupDashboard.tsx (Server Component)
import { GroupDashboardClient } from './GroupDashboardClient';
import { prisma } from '@/prisma'; // Adjust this import according to your project structure
import { auth } from '@/auth';
import { GroupGame } from '@/types/gameTypes'; // Importing the GroupGame type

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
            loans: true, // Include loan details
        }
    });

    // console.log('Group Games: ', groupGames);

    // Group the games by gameId, including details of each user's game copy
    const groupedGames = groupGames.reduce((acc: { [key: string]: GroupGame }, userGame) => {
        const gameId = userGame.gameId;
        const isLoaned = userGame.loans.some((loan) => loan.endDate == null);
    
        // Initialize the game group if it doesn't exist
        if (!acc[gameId]) {
            acc[gameId] = {
                id: gameId,
                game: {
                    ...userGame.game,
                    yearPublished: userGame.game.yearPublished ?? 0, // Ensure yearPublished is a number
                },
                count: 0,
                availableCount: 0,
                loanedCount: 0,
                isLoaned: false,
                userGames: [], // Store individual copies here
                loans: [],
            };
        }
    
        // Add each copy’s details to the userGames array
        acc[gameId].userGames?.push({
            userGameId: userGame.id,
            user: userGame.user,
            isLoaned,
        });
    
        // Aggregate loan details
        userGame.loans.forEach(loan => {
            acc[gameId].loans?.push(loan); // Add loan to the group's loan details
        });
    
        // Update counts
        acc[gameId]!.count += 1;
    
        if (isLoaned) {
            acc[gameId]!.loanedCount++;
        } else {
            acc[gameId]!.availableCount++;
        }
        
        acc[gameId]!.isLoaned = acc[gameId]!.isLoaned || isLoaned;
        
    
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
