// app/api/messages/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/prisma' // Adjust this import according to your project structure

export async function GET(req: Request, props: { query: Promise<{ groupId: string }> }) {
    const query  = await props.query
    const { groupId } = query

    try {
        const messages = await prisma.message.findMany({
            where: {
                groupId: groupId, // Ensure groupId is a string
            },
        })

        return NextResponse.json(messages)
    } catch (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 })
    }
}