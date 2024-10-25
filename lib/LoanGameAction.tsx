import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"; // Replace with your Select component if needed
import { LoanGameActionProps } from '@/types/gameTypes';

const LoanGameAction = ({ game, users, groupId, currentUserId, userGameId }: LoanGameActionProps) => {
    const [borrowerId, setBorrowerId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoaned = game.userGames.some(userGame => userGame.isLoaned && userGame.user.id === currentUserId);

    const loanGame = async () => {
        if (!borrowerId) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/loans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    borrowerId,
                    lenderId: currentUserId,
                    userGameId: userGameId, // ID of the UserGame (not GameData)
                    groupId, // Include the group ID for reference
                }),
            });

            setIsSubmitting(false);

            if (response.ok) {
                // Handle success (e.g., show a success message or refresh the list)
                console.log("Game loaned successfully");
            } else {
                // Handle error
                console.error("Failed to loan the game");
            }
        } catch (error) {
            setIsSubmitting(false);
            console.error("An error occurred while loaning the game:", error);
        }
    };

    // Function to end the loan
    const endLoan = async () => {
        setIsSubmitting(true);

        try {
            console.log('Ending loan for game:', game);

            const lastLoan = game.loans?.findLast(loan => loan.endDate === null && loan.lenderId === currentUserId); // Example condition with userId check
            if (!lastLoan) {
                console.error("No active loan found");
                return;
            }
            console.log('Last loan:', lastLoan);

            const response = await fetch(`/api/loans`, {
                method: 'PATCH', // Assuming PATCH is used to update the loan
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lastLoan
                }),
            });

            setIsSubmitting(false);

            if (response.ok) {
                console.log("Loan ended successfully");
            } else {
                console.error("Failed to end the loan");
            }
        } catch (error) {
            setIsSubmitting(false);
            console.error("An error occurred while ending the loan:", error);
        }
    };

    return (
        <div className="flex items-center space-x-4">
            {isLoaned ? (
                <Button onClick={endLoan} disabled={isSubmitting}>
                    {isSubmitting ? 'Ending loan...' : 'End Loan'}
                </Button>
            ) : (
                <>
                    <Select value={borrowerId} onValueChange={setBorrowerId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Borrower" />
                        </SelectTrigger>
                        <SelectContent>
                            {users
                                .filter(user => user.id !== currentUserId) // Exclude current user from the borrower list
                                .map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.bggUserName || user.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={loanGame} disabled={isSubmitting || !borrowerId}>
                        {isSubmitting ? 'Loaning...' : 'Loan Game'}
                    </Button>
                </>
            )}
        </div>
    );
};

export default LoanGameAction;
