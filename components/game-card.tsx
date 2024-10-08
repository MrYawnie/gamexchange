import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, Users, Star } from "lucide-react"

interface GameData {
  thumbnail: string
  name: string
  yearPublished: number
  stats: {
    minPlayers: number
    playingTime: number
  }
  ratings: {
    average: number
    usersRated: number
  }
}

export default function Component(props: { game: GameData }) {
  const { game } = props

  return (
    <Card className="w-[300px] overflow-hidden">
      <div className="aspect-[16/9] relative">
        <img
          src={game.thumbnail}
          alt={`${game.name} thumbnail`}
          className="object-cover w-full h-full"
        />
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
                  <span className="font-medium">{game.ratings.average.toFixed(1)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Average rating out of 10</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span>{game.ratings.usersRated.toLocaleString()} ratings</span>
        </div>
      </CardContent>
    </Card>
  )
}