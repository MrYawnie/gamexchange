'use client'

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon, ArrowLeftIcon, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from '@prisma/client';
import { Message } from '@prisma/client/edge';
import GroupGames from './GroupGamesTable';
import { GroupGame } from '@/types/gameTypes';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function GroupDashboardClient({
    users,
    messages: initialMessages,
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
    groupGames: GroupGame[]
}) {
    const router = useRouter();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        // Set up the mutation observer to watch for changes in the messages list
        const scrollArea = scrollAreaRef.current;
        if (!scrollArea) return;

        const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
        if (!viewport) return;

        const observer = new MutationObserver(() => {
            viewport.scrollTop = viewport.scrollHeight;
        });

        observer.observe(viewport, {
            childList: true,
            subtree: true
        });

        // Initial scroll
        viewport.scrollTop = viewport.scrollHeight;

        return () => observer.disconnect();
    }, []); // Empty dependency array since we want to set this up once

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const message: Omit<Message, 'id'> = {
                userId: currentUserId,
                content: newMessage.trim(),
                timestamp: new Date(),
                groupId: groupId,
            };

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...message, groupId }),
            });

            if (response.ok) {
                const savedMessage = await response.json();
                setMessages((prevMessages) => [...prevMessages, savedMessage]);
                setNewMessage('');
            } else {
                console.error('Failed to save message:', response.statusText);
            }
        }
    };

    useEffect(() => {
        // Fetch messages from the API
        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/messages/${groupId}`);
                if (response.ok) {
                    const newMessages = await response.json();
                    setMessages(newMessages);
                } else {
                    console.error('Failed to fetch messages:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };
    
        // Initial fetch
        fetchMessages();
    
        // Set up an interval to fetch messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
    
        // Clean up interval on component unmount
        return () => clearInterval(interval);
    }, [groupId]);

    const handleBack = () => {
        // router.back();
        router.push('/dashboard');
        
    };

    const handleExitGroup = async () => {
        setIsDialogOpen(false);
        const response = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' });
        if (response.ok) {
            router.push('/dashboard');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Dashboard
                </Button>
                <div className='text-center'>
                    <h1 className="text-2xl font-bold my-1">{groupName} Dashboard</h1>
                    <h4 className="text-lg font-semibold my-1">Group ID: {groupId}</h4>
                </div>
                {/* <Button variant="outline" onClick={handleExitGroup}>
                    Leave group
                    <LogOut className="ml-2 h-4 w-4" />
                </Button> */}
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline">
                            Leave group
                            <LogOut className="ml-2 h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Exit</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to leave the group?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleExitGroup}>
                                Leave
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Group Chat</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[calc(100vh-300px)] mb-4" ref={scrollAreaRef}>
                                    <ul className="space-y-4">
                                        {messages.map((message) => {
                                            const user = users.find(u => u.id === message.userId);
                                            return (
                                                <li key={message.id} className="flex items-start space-x-4">
                                                    <Avatar>
                                                        <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
                                                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{user?.bggUserName || user?.name}</p>
                                                        <p>{message.content}</p>
                                                    </div>
                                                </li>
                                            );
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