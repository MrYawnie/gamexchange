// app/GroupDashboardClient.tsx (Client Component)
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendIcon, ArrowLeftIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User } from '@prisma/client'
import { Message } from '@prisma/client/edge'
import GroupGames from '../group-games'
import { GroupGame } from '../../types/gameTypes' // Importing the GroupGame type

export function GroupDashboardClient({
    users,
    messages,
    groupId,
    groupName,
    currentUserId,
    groupGames
}: {
    users: User[],
    messages: Message[],
    groupId: string,
    groupName: string,
    currentUserId: string,
    groupGames: GroupGame[]  // Using GroupGame[] type
}) {
    const [newMessage, setNewMessage] = useState('')
    const [, setMessages] = useState<Message[]>(messages)

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newMessage.trim()) {
            const message: Omit<Message, 'id'> = {
                userId: currentUserId, // Replace this with the actual current user's ID
                content: newMessage.trim(),
                timestamp: new Date(),
                groupId: groupId,
            }

            // Send message to the server (API route)
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...message, groupId }),
            })

            if (response.ok) {
                const savedMessage = await response.json()
                setMessages((prevMessages) => [...prevMessages, savedMessage])
                setNewMessage('')
            }
        }
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">

                <h1 className="text-2xl font-bold mb-6">{groupName} Dashboard</h1>
                <h4 className="text-lg font-semibold mb-4">Group ID: {groupId}</h4>
                <Button variant="outline">
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Exit Group
                </Button>
            </div>
            <Tabs defaultValue="chat">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="games">Games</TabsTrigger>
                </TabsList>
                <TabsContent value="chat">
                    <div className="grid gap-6 md:grid-cols-[300px_1fr_300px]">
                        <Card>
                            <CardHeader>
                                <CardTitle>Group Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[calc(100vh-200px)]">
                                    <ul className="space-y-4">
                                        {users.map((user) => (
                                            <li key={user.id} className="flex items-center space-x-4">
                                                <Avatar>
                                                    <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                                                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{user.bggUserName || user.name}</span>
                                            </li>
                                        ))
                                        }
                                    </ul>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Group Chat</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[calc(100vh-300px)] mb-4">
                                    <ul className="space-y-4">
                                        {messages.map((message) => {
                                            const user = users.find(u => u.id === message.userId)
                                            return (
                                                <li key={message.id} className="flex items-start space-x-4">
                                                    <Avatar>
                                                        <AvatarImage src={user?.image || undefined} alt={user?.name || undefined} />
                                                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{user?.bggUserName || user?.name}</p>
                                                        <p>{message.content}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(message.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </ScrollArea>
                                <form onSubmit={sendMessage} className="flex space-x-2">
                                    <Input
                                        type="text"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-grow"
                                    />
                                    <Button type="submit">
                                        <SendIcon className="h-4 w-4 mr-2" />
                                        Send
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Group Games</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[calc(100vh-200px)]">
                                    <ul className="space-y-4">
                                        {groupGames.map((game) => (
                                            <li key={game.game.gameId} className="flex items-center space-x-4">
                                                <Avatar>
                                                    <AvatarImage src={game.game.thumbnail || ''} alt={String(game.game.name) || 'Game'} />
                                                </Avatar>
                                                <span>{game.game.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="games">
                    <GroupGames
                        games={groupGames}
                        currentUserId={currentUserId}
                        groupId={groupId}
                        users={users}
                        errorMessage={null}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
