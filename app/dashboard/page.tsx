// app/dashboard/page.tsx
import DashboardServer from './DashboardServer';
import DashboardClient from './DashboardClient';

const DashboardPage = () => {
  return (
    <>
      <DashboardClient />
      <DashboardServer />
    </>
  );
};

export default DashboardPage;
