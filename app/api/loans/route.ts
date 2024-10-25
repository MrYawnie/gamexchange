import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma'; // Adjust this import as needed

export async function POST(req: NextRequest) {
    try {
        const { borrowerId, lenderId, userGameId } = await req.json();

        // Validate the request payload
        if (!borrowerId || !lenderId || !userGameId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if the game is already loaned
        const existingLoan = await prisma.loan.findFirst({
            where: {
                userGameId,
                endDate: null // If no return date, the game is still loaned
            },
        });

        console.log('Existing loan:', existingLoan);

        if (existingLoan) {
            return NextResponse.json({ error: 'Game is already loaned' }, { status: 409 });
        }

        // Create a new loan
        const loan = await prisma.loan.create({
            data: {
                borrowerId,
                lenderId,
                userGameId,
            },
        });

        console.log('Created loan:', loan);

        const updatedGame = await prisma.userGame.update({
            where: {
                id: userGameId
            },
            data: {
                isLoaned: true,
            },
        });
        console.log('Updated game:', updatedGame);

        return NextResponse.json({ loan, updatedGame }, { status: 201 });
    } catch (error) {
        console.error('Error creating loan:', error);
        return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { lastLoan } = await req.json();

        // Validate the request payload
        if (!lastLoan) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Update the loan
        const updatedLoan = await prisma.loan.update({
            where: {
                id: lastLoan.id,
            },
            data: {
                endDate: new Date(),
            },
        });

        console.log('Updated loan:', updatedLoan);

        const updatedGame = await prisma.userGame.update({
            where: {
                id: lastLoan.userGameId
            },
            data: {
                isLoaned: false,
            },
        });

        console.log('Updated game:', updatedGame);

        return NextResponse.json({ updatedLoan, updatedGame }, { status: 200 });
    } catch (error) {
        console.error('Error updating loan:', error);
        return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 });
    }
}