import { auth } from "@/auth"; // Import your auth function
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(req: Request) {
  const session = await auth(); // Get the session using your auth function

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bggUsername } = await req.json();

  try {
    const user = await prisma.user.update({
      where: { email: session.user.email }, // Use the user's email to find the record
      data: { bggUserName: bggUsername }, // Save BGG username
    });

    return NextResponse.json({ message: 'BGG username saved successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to save BGG username' }, { status: 500 });
  }
}
