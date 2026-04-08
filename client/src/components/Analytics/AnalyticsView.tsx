import { BarChart2 } from 'lucide-react';
import DashBreadcrumb from '~/routes/Layouts/DashBreadcrumb';

export default function AnalyticsView() {
  return (
    <div className="flex h-full flex-col">
      <DashBreadcrumb />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-text-secondary">
        <BarChart2 className="h-16 w-16 opacity-20" />
        <p className="text-lg">Analytics coming soon</p>
      </div>
    </div>
  );
}
