// api/loans/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function PATCH(req: NextRequest) {
  try {
    // Extract the 'id' from the request URL
    const { pathname } = req.nextUrl;
    const id = pathname.split('/').pop(); // Assuming 'id' is at the end of the path

    const { endDate } = await req.json();

    // Validate the request payload
    if (!id || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update the loan's endDate
    const updatedLoan = await prisma.loan.update({
      where: {
        id: id,
      },
      data: {
        endDate: new Date(endDate),
      },
    });

    // Update the isLoaned status of the userGame
    const updatedGame = await prisma.userGame.update({
      where: {
        id: updatedLoan.userGameId,
      },
      data: {
        isLoaned: false,
      },
    });

    return NextResponse.json({ updatedLoan, updatedGame }, { status: 200 });
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 });
  }
}