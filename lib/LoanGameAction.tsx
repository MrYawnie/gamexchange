import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { LoanGameActionProps } from '@/types/gameTypes';

const LoanGameAction = ({ game, users, groupId, currentUserId, userGameId, onLoanStatusChange, isLoaned }: LoanGameActionProps) => {
    const [borrowerId, setBorrowerId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentLoanId, setCurrentLoanId] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaned && !currentLoanId) {
            // Find the active loan for this userGame
            const activeLoan = game.loans?.find(
                (loan) =>
                    loan.userGameId === userGameId &&
                    loan.lenderId === currentUserId &&
                    loan.endDate === null
            );

            if (activeLoan) {
                setCurrentLoanId(activeLoan.id);
            } else {
                console.error('No active loan found for this game.');
            }
        }
    }, [isLoaned, currentLoanId, game.loans, userGameId, currentUserId]);

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
                const data = await response.json();
                const loan = data.loan;
                setCurrentLoanId(loan.id);
                // Update your frontend state
                onLoanStatusChange(game.game.gameId, true, userGameId);
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
            if (!currentLoanId) {
                console.error("No active loan found");
                setIsSubmitting(false);
                return;
            }
    
            // Send PATCH request to API endpoint with loan ID
            const response = await fetch(`/api/loans/${currentLoanId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endDate: new Date().toISOString(),
                }),
            });
    
            setIsSubmitting(false);
    
            if (response.ok) {
                onLoanStatusChange(game.game.gameId, false, userGameId);
                setCurrentLoanId(null); // Reset the loan ID
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