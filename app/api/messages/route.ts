// app/api/messages/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/prisma' // Adjust this import according to your project structure
import { auth } from '@/auth';

export async function POST(req: Request) {
  const { userId, content, timestamp, groupId } = await req.json()

  try {
    const message = await prisma.message.create({
      data: {
        userId,
        content,
        timestamp: new Date(timestamp),
        groupId, // Make sure to have this field in your model
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ message: 'Error creating message' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await auth() // Authenticate the user
  if (!session || !session.user) {
    return NextResponse.json({ error: 'You are not logged in.' }, { status: 401 })
  }

  const url = new URL(req.url);
  const groupId = url.searchParams.get('groupId');

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

      const messages = await prisma.message.findMany({
          where: {
              groupId: groupId, // Ensure groupId is a string
          },
      });

      return NextResponse.json(messages);
  } catch (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
  }
}
