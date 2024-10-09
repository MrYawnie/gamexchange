// app/api/groups/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/prisma'; // Adjust the path based on your project structure
import { auth } from '@/auth'; // Import your authentication function

export async function GET() {
    const session = await auth(); // Authenticate the user
    if (!session || !session.user) {
        return NextResponse.json({ error: 'You are not logged in.' }, { status: 401 });
    }

    // Fetch all groups
    const allGroups = await prisma.group.findMany();

    // Fetch user groups based on user ID
    const userGroups = await prisma.userGroup.findMany({
        where: {
            userId: session.user.id, // Use the actual user ID from your session/authentication
        },
        include: {
            group: true, // Include the group data in the results
        },
    });

    return NextResponse.json({
        allGroups,
        userGroups: userGroups.map((ug) => ug.group), // Extract only the group information
    });
}


export async function POST(request: Request) {
    const { action, name, id } = await request.json(); // Destructure action, name, and id from request body

    const session = await auth(); // Authenticate the user
    if (!session || !session.user) {
        return NextResponse.json({ error: 'You are not logged in.' }, { status: 401 });
    }

    if (action === 'create') {
        // Create a new group and automatically join the user
        const newGroup = await prisma.group.create({
            data: {
                name,
                // You can add more fields as necessary
            },
        });

        // Automatically join the user to the newly created group
        await prisma.userGroup.create({
            data: {
                userId: session.user.id as string, // Ensure userId is a string
                groupId: newGroup.id,
            },
        });

        return NextResponse.json({ group: newGroup, message: 'Group created and joined successfully.' });
    }

    if (action === 'join') {
        if (!id) {
            return NextResponse.json({ error: 'Group ID is required to join.' }, { status: 400 });
        }

        const group = await prisma.group.findUnique({
            where: { id },
            include: { userGroups: true }, // Include userGroups to check membership
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found." }, { status: 404 });
        }

        const userIsMember = group.userGroups.some(userGroup => userGroup.userId === session.user.id); // Replace with actual user ID

        if (userIsMember) {
            return NextResponse.json({ error: "You're already a member of this group." }, { status: 400 });
        }

        const updatedGroup = await prisma.userGroup.create({
            data: {
                userId: session.user.id as string, // Ensure userId is a string
                groupId: id,
            },
        });

        return NextResponse.json(updatedGroup);
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
}