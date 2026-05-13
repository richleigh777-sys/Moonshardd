import { ResizableFrame } from '../../ui/ResizableFrame';
import { RevenueChart } from './RevenueChart';
import { PipelineHealthWidget } from './PipelineHealthWidget';
import { Sale } from '../../../types';

interface DashboardMainChartsProps {
    sales: Sale[];
    hasSales: boolean;
}

export const DashboardMainCharts: React.FC<DashboardMainChartsProps> = ({ sales, hasSales }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 flex-1 min-h-[180px]">
        <ResizableFrame 
            className="lg:col-span-2 h-full min-h-[180px]" 
            persistenceKey="chart_revenue_trend"
            direction="vertical"
        >
            <RevenueChart data={sales} hasSales={hasSales} />
        </ResizableFrame>

        <ResizableFrame 
            className="h-full min-h-[180px]" 
            persistenceKey="chart_pipeline_health"
            direction="vertical"
        >
            <PipelineHealthWidget sales={sales} hasSales={hasSales} />
        </ResizableFrame>
    </div>
);
