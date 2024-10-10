import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GameListProps } from '@/types/gameTypes';

export default function GroupGames({ games }: GameListProps) {
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
                                <TableHead>Game</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Owner(s)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {games.map((game) => (
                                <TableRow key={game.game.gameId}>
                                    <TableCell className="font-medium">{game.game.name}</TableCell>
                                    <TableCell>{game.game.yearPublished}</TableCell>
                                    <TableCell>{game.game.ratings.average?.toFixed(1)}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-[-6px]">
                                            {game.owners?.map((owner) => (
                                                console.log(owner),
                                                <Avatar key={owner.id} className="h-6 w-6">
                                                    <AvatarImage src={owner.image || ''} alt={owner.name || 'User'} />
                                                    <AvatarFallback>{owner.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                    </TableCell>
                                    {/* <TableCell>
                    <Badge variant={game. ? "secondary" : "outline"}>
                      {game.isLoaned ? "Loaned" : "Available"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {game.owner.id === currentUserId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleLoan(game.id)}
                      >
                        {game.isLoaned ? "Mark Available" : "Mark Loaned"}
                      </Button>
                    )}
                  </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea >
            </CardContent >
        </Card >
    )
}