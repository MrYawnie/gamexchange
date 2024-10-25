import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GameListProps } from '@/types/gameTypes';
import LoanGameAction from '../lib/LoanGameAction';
import { useReactTable, getCoreRowModel, getExpandedRowModel, ColumnDef } from '@tanstack/react-table';
import React from "react";

export default function GroupGames({ games, currentUserId, groupId, users }: GameListProps) {
    console.log('Group Games:', games);
    const columns: ColumnDef<any>[] = [
        {
            header: 'Game',
            accessorKey: 'game.name',
            cell: ({ row, getValue }) => {
                const isExpanded = row.getIsExpanded();
                const subItemsCount = row.original.userGames.length; // Adjust this based on where your sub-items are stored
                const canExpand = subItemsCount > 1; // Allow expansion only if there are more than 1 sub-item
        
                console.log('Row:', row, 'Game Name:', getValue(), 'Is Expanded:', isExpanded, 'Can Expand:', canExpand);
        
                return (
                    <span 
                        onClick={canExpand ? () => row.toggleExpanded() : undefined} 
                        className={`cursor-pointer ${canExpand ? 'text-blue-600' : ''}`}
                    >
                        {getValue()}
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
                    {getValue() === 'boardgame' ? 'Base Game' : getValue() === 'boardgameexpansion' ? 'Expansion' : getValue()}
                </span>
            ),
        },
        { header: 'Year', accessorKey: 'game.yearPublished' },
        {
            header: 'Rating',
            accessorKey: 'game.ratings.average',
            cell: ({ getValue }) => getValue()?.toFixed(1),
        },
        {
            header: 'Owner(s)',
            cell: ({ row }) => (
                <div className="flex space-x-[-6px]">
                    {row.original.userGames.map((userGame) => (
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
                // Find the userGame associated with the current user
                const userGame = row.original.userGames.find((game) => game.user.id === currentUserId);

                // Render LoanGameAction if the userGame exists
                return userGame ? (
                    <LoanGameAction
                        game={row.original}
                        users={users}
                        groupId={groupId}
                        currentUserId={currentUserId}
                        userGameId={userGame.userGameId} // Use the correct userGameId here
                    />
                ) : null;
            },
        },

    ];

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
                                    <TableHead key={index}>{column.header}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <TableRow>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {cell.column.columnDef.cell
                                                    ? cell.column.columnDef.cell(cell)
                                                    : cell.getValue()}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && row.original.userGames.map((userGame) => (
                                        <TableRow key={userGame.userGameId} className="pl-4">
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                            <TableCell>
                                                <Avatar key={userGame.user.id} className="h-6 w-6">
                                                    <AvatarImage src={userGame.user.image || ''} alt={userGame.user.name || 'User'} />
                                                    <AvatarFallback>{userGame.user.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell>
                                                <span className={userGame.isLoaned ? 'text-red-500' : 'text-green-500'}>
                                                    {userGame.isLoaned ? 'Loaned' : 'Available'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {userGame.user.id === currentUserId && (
                                                    <LoanGameAction
                                                        game={row.original}
                                                        users={users}
                                                        groupId={groupId}
                                                        currentUserId={currentUserId}
                                                        userGameId={userGame.userGameId}
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
