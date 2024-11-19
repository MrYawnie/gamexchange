import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, Users, Star } from "lucide-react"
import Image from "next/image"
import { GameData } from "@/types/gameTypes"

export default function Component(props: { game: GameData }) {
    const { game } = props
    const isExpansion = game.objectType === "boardgameexpansion"

    return (
        <Card whileHover={{ scale: 1.05, transition: { duration: 0.2 } }} className="w-[300px] overflow-hidden">
            <div className="aspect-[16/9] relative">
                <Image
                    src={game.image}
                    alt={`${game.name} thumbnail`}
                    className="object-cover w-full h-full"
                    width={300} // Set the appropriate width
                    height={300} // Set the appropriate height
                />
                <div className="absolute top-0 left-0 p-2">
                    <Badge
                        variant={isExpansion ? "destructive" : "default"}
                        className="text-xs font-semibold uppercase"
                    >
                        {isExpansion ? "Expansion" : "Base Game"}
                    </Badge>
                </div>
            </div>
            <CardHeader className="p-4">
                <CardTitle className="text-lg font-bold">{game.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Published in {game.yearPublished}</p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex justify-between items-center mb-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {game.stats.minPlayers}+ players
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {game.stats.playingTime} min
                    </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{game.ratings.average?.toFixed(1)}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Average rating out of 10</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <span>{game.ratings.usersRated?.toLocaleString()} ratings</span>
                </div>
            </CardContent>
        </Card>
    )
}