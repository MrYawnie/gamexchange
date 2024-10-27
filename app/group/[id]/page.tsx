// app/group/[id]/page.tsx
import GroupDashboardServer from '@/components/server/GroupDashboardServer';

interface GroupPageProps {
    params: Promise<{
        id: string;
    }>;
}

const GroupPage = async (props: GroupPageProps) => {
    const params = await props.params;
    const { id: groupId } = params; // Extract the 'id' from the dynamic route

    // Pass the extracted 'groupId' to GroupDashboardServer
    const groupDashboard = await GroupDashboardServer({ groupId });
    return groupDashboard;
};

export default GroupPage;
