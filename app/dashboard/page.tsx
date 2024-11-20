// app/dashboard/page.tsx
import React, { Suspense } from 'react';
import DashboardClient from './DashboardClient';

// Optional: Create a Loading component for fallback UI
const Loading = () => (
  <div className="flex justify-center items-center h-20">
    <p>Loading...</p>
  </div>
);

const DashboardPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardClient />
    </Suspense>
  );
};

export default DashboardPage;