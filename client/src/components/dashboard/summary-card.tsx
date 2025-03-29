import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trendValue: number;
  trendDirection: 'up' | 'down';
  trendLabel: string;
  iconBgColor: string;
}

export function SummaryCard({
  title,
  value,
  icon,
  trendValue,
  trendDirection,
  trendLabel,
  iconBgColor,
}: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex items-start transition-shadow duration-200 hover:shadow-lg">
      <div className={`p-3 rounded-md text-white mr-4 ${iconBgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
        <p className={`text-xs flex items-center ${
          trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
        }`}>
          {trendDirection === 'up' ? (
            <ArrowUpIcon className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDownIcon className="h-3 w-3 mr-1" />
          )}
          <span>
            {trendDirection === 'up' ? '↑' : '↓'} {trendValue} {trendLabel}
          </span>
        </p>
      </div>
    </div>
  );
}
