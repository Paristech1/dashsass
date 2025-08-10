import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Clock, AlertTriangle, CheckCircle, AlertCircle, PauseCircle } from "lucide-react";

interface SlaBadgeProps {
  slaStatus: string;
  slaDeadline?: Date | string | null;
  slaPaused?: boolean | null;
  size?: 'sm' | 'md' | 'lg';
}

export function SlaBadge({ slaStatus, slaDeadline, slaPaused = false, size = 'md' }: SlaBadgeProps) {
  // Convert string date to Date object if needed
  const deadline = slaDeadline 
    ? typeof slaDeadline === 'string' 
      ? new Date(slaDeadline)
      : slaDeadline
    : null;
  
  // Generate human-readable time until/since deadline
  const timeDisplay = deadline 
    ? formatDistanceToNow(deadline, { addSuffix: true }) 
    : 'No deadline';
  
  // Define badge styles and icons based on status
  const getStatusStyles = () => {
    switch(slaStatus) {
      case 'on_track':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: <CheckCircle className={size === 'sm' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5'} />,
          label: 'On Track',
          tooltip: `SLA deadline is ${timeDisplay}`
        };
      case 'at_risk':
        return {
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200',
          icon: <AlertCircle className={size === 'sm' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5'} />,
          label: 'At Risk',
          tooltip: `SLA deadline is approaching ${timeDisplay}`
        };
      case 'breached':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: <AlertTriangle className={size === 'sm' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5'} />,
          label: 'Breached',
          tooltip: `SLA deadline was ${timeDisplay}`
        };
      case 'paused':
        return {
          bgColor: 'bg-secondary',
          textColor: 'text-foreground',
          borderColor: 'border-border',
          icon: <PauseCircle className={size === 'sm' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5'} />,
          label: 'Paused',
          tooltip: 'SLA timer is paused'
        };
      case 'met':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          icon: <CheckCircle className={size === 'sm' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5'} />,
          label: 'SLA Met',
          tooltip: 'Resolved within SLA deadline'
        };
      default:
        return {
          bgColor: 'bg-secondary',
          textColor: 'text-foreground',
          borderColor: 'border-border',
          icon: <Clock className={size === 'sm' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5'} />,
          label: 'No SLA',
          tooltip: 'No SLA information available'
        };
    }
  };
  
  // Override with paused state if slaPaused is true
  const styles = slaPaused 
    ? {
        bgColor: 'bg-secondary',
        textColor: 'text-foreground',
        borderColor: 'border-border',
        icon: <PauseCircle className={size === 'sm' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5'} />,
        label: 'Paused',
        tooltip: 'SLA timer is paused'
      } 
    : getStatusStyles();
  
  // Set smaller text size for small badges
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const paddingSize = size === 'sm' ? 'py-0 px-1.5' : size === 'md' ? 'py-0.5 px-2' : 'py-1 px-3';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${styles.bgColor} ${styles.textColor} ${styles.borderColor} ${textSize} ${paddingSize} flex items-center font-medium`}
          >
            {styles.icon}
            {styles.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{styles.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Component for escalation badge
interface EscalationBadgeProps {
  isEscalated: boolean;
  escalatedAt?: Date | string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function EscalationBadge({ isEscalated, escalatedAt, size = 'md' }: EscalationBadgeProps) {
  if (!isEscalated) return null;
  
  // Convert string date to Date object if needed
  const escalationTime = escalatedAt 
    ? typeof escalatedAt === 'string' 
      ? new Date(escalatedAt)
      : escalatedAt
    : null;
  
  // Generate human-readable time since escalation
  const timeDisplay = escalationTime 
    ? formatDistanceToNow(escalationTime, { addSuffix: true }) 
    : '';
  
  // Set smaller text size for small badges
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const paddingSize = size === 'sm' ? 'py-0 px-1.5' : size === 'md' ? 'py-0.5 px-2' : 'py-1 px-3';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`bg-purple-100 text-purple-800 border-purple-200 ${textSize} ${paddingSize} flex items-center font-medium`}
          >
            <AlertTriangle className={size === 'sm' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1.5'} />
            Escalated
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {timeDisplay 
              ? `Escalated ${timeDisplay}`
              : 'This ticket has been escalated'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}