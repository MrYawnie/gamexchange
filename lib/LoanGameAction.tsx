import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { LoanGameActionProps, UserGame } from '@/types/gameTypes';

const LoanGameAction = ({ game, users, groupId, currentUserId, userGameId, onLoanStatusChange, isLoaned }: LoanGameActionProps) => {
    const [borrowerId, setBorrowerId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    userGameId: userGameId,
                    groupId,
                }),
            });

            setIsSubmitting(false);

            if (response.ok) {
                onLoanStatusChange(game.game.gameId, true, borrowerId);
            } else {
                console.error("Failed to loan the game");
            }
        } catch (error) {
            setIsSubmitting(false);
            console.error("An error occurred while loaning the game:", error);
        }
    };

    const endLoan = async () => {
        setIsSubmitting(true);

        try {
            const lastLoan = game.loans?.findLast(loan => loan.endDate === null && loan.lenderId === currentUserId);
            if (!lastLoan) {
                console.error("No active loan found");
                return;
            }

            const response = await fetch(`/api/loans`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lastLoan
                }),
            });

            setIsSubmitting(false);

            if (response.ok) {
                onLoanStatusChange(game.game.gameId, false, lastLoan.borrowerId);
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
                            {(users || [])
                                .filter(user => user.id !== currentUserId)
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