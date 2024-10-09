// app/dashboard/DashboardClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircleIcon, UserPlusIcon, LogOutIcon, ArrowRightIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

const DashboardClient = () => {
    const router = useRouter();
    const [userGroups, setUserGroups] = useState<{ id: string; name: string }[]>([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [joinGroupId, setJoinGroupId] = useState('');
    const [joinError, setJoinError] = useState('');
    const [activeGroup, setActiveGroup] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        // Fetch all groups and user groups from the API on component mount
        const fetchGroups = async () => {
            try {
                const response = await fetch('/api/groups');

                if (!response.ok) {
                    // If the response is not OK, throw an error with status code and message
                    const errorData = await response.json(); // This might fail if the response is not JSON
                    throw new Error(`Error ${response.status}: ${errorData.error || 'Unknown error'}`);
                }

                const data = await response.json();
                setUserGroups(data.userGroups);
            } catch (error) {
                console.error('Failed to fetch groups:', error);
                // You can set some state to display an error message to the user if needed
            }
        };

        fetchGroups();
    }, []);

    const createGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', name: newGroupName.trim() }),
            });

            if (response.ok) {
                const newGroup = await response.json();
                setUserGroups((prev) => [...prev, newGroup]);
                setNewGroupName(newGroup.name);
            } else {
                const errorData = await response.json();
                console.error('Error creating group:', errorData.error);
            }
        }
    };

    const joinGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setJoinError('');
        if (joinGroupId.trim()) {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'join', id: joinGroupId.trim() }),
            });

            if (response.ok) {
                const joinedGroup = await response.json();
                setUserGroups((prev) => [...prev, joinedGroup]);
                setJoinGroupId('');
            } else {
                const errorData = await response.json();
                setJoinError(errorData.error);
            }
        }
    };

    const exitGroup = async (groupId: string) => {
        const response = await fetch(`/api/groups/${groupId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setUserGroups((prev) => prev.filter(group => group.id !== groupId));
            if (activeGroup && activeGroup.id === groupId) {
                setActiveGroup(null);
            }
        } else {
            const errorData = await response.json();
            console.error('Error leaving group:', errorData);
        }
    };

    const enterGroup = (group: { id: string; name: string }) => {
        // Redirect to the group/[id]/page.tsx with the group's ID
        router.push(`/group/${group.id}`);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Groups</CardTitle>
                        <CardDescription>Groups you are currently a member of</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {userGroups.length > 0 ? (
                            <ul className="space-y-2">
                                {userGroups.map((group) => (
                                    <li key={group.id} className="bg-muted p-2 rounded-md flex justify-between items-center">
                                        <span>
                                            {group.name} <span className="text-muted-foreground text-sm">(ID: {group.id})</span>
                                        </span>
                                        <div className="space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => enterGroup(group)}>
                                                <ArrowRightIcon className="mr-2 h-4 w-4" />
                                                Enter
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => exitGroup(group.id)}>
                                                <LogOutIcon className="mr-2 h-4 w-4" />
                                                Exit
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">You are not a member of any groups yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Tabs defaultValue="create">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Create Group</TabsTrigger>
                        <TabsTrigger value="join">Join Group</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create a New Group</CardTitle>
                                <CardDescription>Start a new private group</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={createGroup}>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            type="text"
                                            placeholder="Group Name"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                        />
                                        <Button type="submit">
                                            <PlusCircleIcon className="mr-2 h-4 w-4" />
                                            Create
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="join">
                        <Card>
                            <CardHeader>
                                <CardTitle>Join an Existing Group</CardTitle>
                                <CardDescription>Enter a group ID to join</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={joinGroup}>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            type="text"
                                            placeholder="Group ID"
                                            value={joinGroupId}
                                            onChange={(e) => setJoinGroupId(e.target.value)}
                                        />
                                        <Button type="submit">
                                            <UserPlusIcon className="mr-2 h-4 w-4" />
                                            Join
                                        </Button>
                                    </div>
                                </form>
                                {joinError && (
                                    <Alert variant="destructive" className="mt-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{joinError}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default DashboardClient;
