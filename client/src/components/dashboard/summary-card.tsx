import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Link } from "wouter";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trendValue: number;
  trendDirection: 'up' | 'down';
  trendLabel: string;
  iconBgColor: string;
  linkPath?: string;
}

export function SummaryCard({
  title,
  value,
  icon,
  trendValue,
  trendDirection,
  trendLabel,
  iconBgColor,
  linkPath,
}: SummaryCardProps) {
  // Render the icon container - either as a link or a div
  const IconContainer = ({ children }: { children: React.ReactNode }) => {
    if (linkPath) {
      return (
        <Link href={linkPath}>
      <div className={`p-3 rounded-md text-primary-foreground mr-4 ${iconBgColor} cursor-pointer transition-transform hover:scale-110`} title={`View ${title.toLowerCase()}`}>
            {children}
          </div>
        </Link>
      );
    }
    
    return (
      <div className={`p-3 rounded-md text-primary-foreground mr-4 ${iconBgColor}`}>
        {children}
      </div>
    );
  };
  
  return (
    <div className="bg-card rounded-lg shadow-md p-5 flex items-start transition-shadow duration-200 hover:shadow-lg border">
      <IconContainer>
        {icon}
      </IconContainer>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-semibold text-foreground mb-1">{value}</p>
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
