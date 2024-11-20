// app/group/[id]/page.tsx
import GroupDashboardServer from '@/components/server/GroupDashboardServer';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation'; // Import redirect

interface GroupPageProps {
    params: Promise<{
        id: string;
    }>;
}

const GroupPage = async (props: GroupPageProps) => {
    const session = await auth();
    if (!session || !session.user) {
        // Optionally handle unauthenticated users
        redirect('/dashboard'); // Redirect to dashboard if not authenticated
    }
    const userId = session.user.id;

    const params = await props.params;
    const { id: groupId } = params; // Extract the 'id' from the dynamic route

    const group = await prisma.userGroup.findFirst({
        where: {
            userId: userId,
            groupId: groupId
        }
    });

    if (!group) {
        // Redirect to dashboard with an error query parameter
        redirect(`/dashboard?error=access_denied`);
    }
    
    // Pass the extracted 'groupId' to GroupDashboardServer
    const groupDashboard = await GroupDashboardServer({ groupId });
    return groupDashboard;
};

export default GroupPage;