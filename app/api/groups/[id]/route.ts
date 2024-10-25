import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // adjust the import based on your auth utility
import { prisma } from '@/prisma'; // adjust the import based on your prisma instance

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth(); // Authenticate the user
    if (!session || !session.user) {
        return NextResponse.json({ error: 'You are not logged in.' }, { status: 401 });
    }

    const { id } = params;

    // Find the group to check if the user is a member
    const group = await prisma.group.findUnique({
        where: { id },
        include: { userGroups: true }, // Include userGroups to check membership
    });

    if (!group) {
        return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }

    const userIsMember = group.userGroups.some(userGroup => userGroup.userId === session.user.id);

    if (!userIsMember) {
        return NextResponse.json({ error: "You're not a member of this group." }, { status: 400 });
    }

    // Disconnect the user from the group
    await prisma.userGroup.deleteMany({
        where: {
            userId: session.user.id,
            groupId: id,
        },
    });

    return NextResponse.json({ message: 'Successfully left the group.' });
}
