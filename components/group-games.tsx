import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GameListProps, UserGame } from '@/types/gameTypes';
import LoanGameAction from '../lib/LoanGameAction';
import { useReactTable, getCoreRowModel, getExpandedRowModel, ColumnDef } from '@tanstack/react-table';

export default function GroupGames({ games: initialGames, currentUserId, groupId, users }: GameListProps) {
    // Initialize games state at the top of the component
    const [games, setGames] = useState(initialGames);

    // Handler that will update the game's loan status in the state
    const handleLoanStatusChange = (updatedGameId: string, isLoaned: boolean, userGameId: string) => {
        setGames(prevGames =>
            prevGames.map(game =>
                game.game.gameId === updatedGameId
                    ? {
                        ...game,
                        availableCount: isLoaned ? game.availableCount - 1 : game.availableCount + 1,
                        loanedCount: isLoaned ? game.loanedCount + 1 : game.loanedCount - 1,
                        userGames: (game.userGames ?? []).map(userGame =>
                            userGame.userGameId === userGameId
                                ? { ...userGame, isLoaned: isLoaned }
                                : userGame
                        ),
                    }
                    : game
            )
        );
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns: ColumnDef<any>[] = [
        {
            header: 'Game',
            accessorKey: 'game.name',
            cell: ({ row, getValue }) => {
                const isExpanded = row.getIsExpanded();
                const subItemsCount = row.original.userGames.length;
                const canExpand = subItemsCount > 1;

                return (
                    <span
                        onClick={canExpand ? () => row.toggleExpanded() : undefined}
                        className={`cursor-pointer ${canExpand ? 'text-blue-600' : ''}`}
                    >
                        {getValue() as string}
                        {canExpand && (isExpanded ? ' ▲' : ' ▼')}
                    </span>
                );
            },
        },
        {
            header: 'Type',
            accessorKey: 'game.objectType',
            cell: ({ getValue }) => (
                <span>
                    {getValue() === 'boardgame' ? 'Base Game' : getValue() === 'boardgameexpansion' ? 'Expansion' : String(getValue())}
                </span>
            ),
        },
        { header: 'Year', accessorKey: 'game.yearPublished' },
        {
            header: 'Rating',
            accessorKey: 'game.ratings.average',
            cell: ({ getValue }) => {
                const value = getValue();
                return typeof value === 'number' ? value.toFixed(1) : value;
            },
        },
        {
            header: 'Owner(s)',
            cell: ({ row }) => (
                <div className="flex space-x-[-6px]">
                    {row.original.userGames.map((userGame: UserGame) => (
                        <Avatar key={userGame.user.id} className="h-6 w-6">
                            <AvatarImage src={userGame.user.image || ''} alt={userGame.user.name || 'User'} />
                            <AvatarFallback>{userGame.user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
            ),
        },
        {
            header: 'Status',
            cell: ({ row }) => {
                const { availableCount, loanedCount } = row.original;
                return (
                    <div>
                        <span className={availableCount > 0 ? 'text-green-500' : 'text-red-500'}>
                            {availableCount} Available
                        </span>
                        {' / '}
                        <span className={loanedCount > 0 ? 'text-red-500' : 'text-green-500'}>
                            {loanedCount} Loaned
                        </span>
                    </div>
                );
            },
        },
        {
            header: 'Action',
            cell: ({ row }) => {
                const userGame = row.original.userGames.find((game: UserGame) => game.user.id === currentUserId);
                const isLoaned = userGame ? userGame.isLoaned : false;

                // Render LoanGameAction only if the userGame exists
                return userGame ? (
                    <LoanGameAction
                        game={row.original}
                        isLoaned={isLoaned}
                        users={users}
                        groupId={groupId}
                        currentUserId={currentUserId}
                        userGameId={userGame.userGameId}
                        onLoanStatusChange={handleLoanStatusChange}  // Pass the handler here
                    />
                ) : null;
            },
        },
    ];

    // Create table instance using React Table
    const table = useReactTable({
        data: games,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Group Games Collection</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[calc(100vh-200px)]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column, index) => (
                                    <TableHead key={index}>{column.header as React.ReactNode}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <TableRow>
                                        {row.getVisibleCells().map((cell, idx) => (
                                            <TableCell key={idx}>
                                                {typeof cell.column.columnDef.cell === 'function'
                                                    ? cell.column.columnDef.cell(cell.getContext())
                                                    : cell.getValue()}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() &&
                                        row.original.userGames.map((userGame: UserGame) => (
                                            <TableRow key={userGame.userGameId} className="pl-4">
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell></TableCell>
                                                <TableCell>
                                                    <Avatar key={userGame.user.id} className="h-6 w-6">
                                                        <AvatarImage
                                                            src={userGame.user.image || ''}
                                                            alt={userGame.user.name || 'User'}
                                                        />
                                                        <AvatarFallback>{userGame.user.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell>
                                                    <span 
                                                        className={userGame.isLoaned ? 'text-red-500' : 'text-green-500'}
                                                    >
                                                        {userGame.isLoaned ? 'Loaned' : 'Available'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {userGame.user.id === currentUserId && (
                                                        <LoanGameAction
                                                            game={row.original}
                                                            isLoaned={userGame.isLoaned}
                                                            users={users}
                                                            groupId={groupId}
                                                            currentUserId={currentUserId}
                                                            userGameId={userGame.userGameId}
                                                            onLoanStatusChange={handleLoanStatusChange}
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}