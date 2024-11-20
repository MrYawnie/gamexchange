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
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { AnimatePresence, motion } from 'framer-motion';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const DashboardClient = () => {
    const router = useRouter();
    const searchParams = useSearchParams(); // Initialize searchParams
    const [userGroups, setUserGroups] = useState<{ id: string; name: string }[]>([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [joinGroupId, setJoinGroupId] = useState('');
    const [joinError, setJoinError] = useState('');
    const [activeGroup, setActiveGroup] = useState<{ id: string; name: string } | null>(null);
    const [accessDenied, setAccessDenied] = useState(false); // New state for access denial
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [groupToExit, setGroupToExit] = useState<string | null>(null); // New state to track which group to exit

    useEffect(() => {
        // Check for access_denied query parameter
        if (searchParams.get('error') === 'access_denied') {
            setAccessDenied(true);
            // Optionally, remove the query parameter after displaying the alert
            const url = new URL(window.location.href);
            url.searchParams.delete('error');
            window.history.replaceState({}, document.title, url.toString());
        }

        // Fetch all groups and user groups from the API on component mount
        const fetchGroups = async () => {
            try {
                const response = await fetch('/api/groups');

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error ${response.status}: ${errorData.error || 'Unknown error'}`);
                }

                const data = await response.json();
                setUserGroups(data.userGroups);
            } catch (error) {
                console.error('Failed to fetch groups:', error);
            }
        };

        fetchGroups();
    }, [searchParams]);

    const createGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', name: newGroupName.trim() }),
            });

            if (response.ok) {
                const { group, message } = await response.json();
                console.log('Created group:', group);
                console.log('Message:', message);
                setUserGroups((prev) => [...prev, group]);
                setNewGroupName('');
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
                console.log('Joined group:', joinedGroup);
                setUserGroups((prev) => [...prev, joinedGroup]);
                setJoinGroupId('');
            } else {
                const errorData = await response.json();
                setJoinError(errorData.error);
            }
        }
    };

    const exitGroup = async (groupId: string) => {
        setIsDialogOpen(false);
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

    const handleExitGroup = (groupId: string) => {
        setGroupToExit(groupId);
        setIsDialogOpen(true);
    };

    // Variants for parent <ul>
    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2,
                duration: 0.3,
            },
        },
    };

    // Variants for child <li>
    const itemVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
        exit: {
            opacity: 0,
            x: -50,
            transition: { duration: 0.6 },
        },
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>

            {/* Display Access Denied Alert */}
            <AnimatePresence>
                {accessDenied && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="mb-4"
                    >
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Access Denied</AlertTitle>
                            <AlertDescription>You do not have permission to access this group.</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Groups</CardTitle>
                        <CardDescription>Groups you are currently a member of</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {userGroups.length > 0 ? (
                            <motion.ul
                                className="group-list space-y-2"
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <AnimatePresence>
                                    {userGroups.map((group) => (
                                        <motion.li
                                            key={group.id}
                                            className="bg-muted p-2 rounded-md flex justify-between items-center"
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            layout
                                            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                                        >
                                            <span>
                                                {group.name} <span className="text-muted-foreground text-sm">(ID: {group.id})</span>
                                            </span>
                                            <div className="space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => enterGroup(group)}>
                                                    <ArrowRightIcon className="mr-2 h-4 w-4" />
                                                    Enter
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleExitGroup(group.id)}>
                                                    <LogOutIcon className="mr-2 h-4 w-4" />
                                                    Exit
                                                </Button>
                                            </div>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </motion.ul>
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

            {/* AlertDialog outside of the list */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                        <Button variant="destructive" onClick={() => groupToExit && exitGroup(groupToExit)}>
                            <LogOutIcon className="mr-2 h-4 w-4" />
                            Leave
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DashboardClient;