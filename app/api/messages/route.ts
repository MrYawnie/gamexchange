// app/api/messages/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/prisma' // Adjust this import according to your project structure

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
