import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';

export async function GET(req: Request, context: { params: { groupId: string } }) {
    const { params } = context;
    const { groupId } = await params; // Await params to handle the asynchronous API

    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: 'You are not logged in.' }, { status: 401 });
    }

    if (!groupId) {
        return NextResponse.json({ message: 'groupId is required' }, { status: 400 });
    }

    try {
        // Check if the user belongs to the group
        const userGroup = await prisma.userGroup.findFirst({
            where: {
                userId: session.user.id,
                groupId: groupId,
            },
        });

        if (!userGroup) {
            return NextResponse.json({ message: 'You do not have access to this group' }, { status: 403 });
        }

        // Fetch messages for the group
        const messages = await prisma.message.findMany({
            where: {
                groupId: groupId,
            },
            orderBy: {
                timestamp: 'asc',
            },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
    }
}
