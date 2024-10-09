// app/group/[id]/page.tsx
import GroupDashboardServer from '@/components/server/GroupDashboardServer';

interface GroupPageProps {
    params: {
        id: string;
    };
}

const GroupPage = ({ params }: GroupPageProps) => {
    const { id: groupId } = params; // Extract the 'id' from the dynamic route

    // Pass the extracted 'groupId' to GroupDashboardServer
    return <GroupDashboardServer groupId={groupId} />;
};

export default GroupPage;
