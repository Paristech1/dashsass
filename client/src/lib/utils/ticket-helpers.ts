import { format, formatDistanceToNow } from "date-fns";

// Format a date with desired format
export function formatDate(
  date: Date | string | null | undefined,
  formatString: string = "MMM d, yyyy"
): string {
  if (!date) return "N/A";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatString);
}

// Format a date relative to now (e.g., "2 hours ago")
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// Format ticket status for display
export function formatStatus(status: string): { label: string; color: string } {
  const statusMap: Record<string, { label: string; color: string }> = {
    open: { 
      label: "Open", 
      color: "bg-blue-100 text-blue-800 border-blue-200" 
    },
    in_progress: { 
      label: "In Progress", 
      color: "bg-purple-100 text-purple-800 border-purple-200" 
    },
    pending: { 
      label: "Pending", 
      color: "bg-amber-100 text-amber-800 border-amber-200" 
    },
    resolved: { 
      label: "Resolved", 
      color: "bg-green-100 text-green-800 border-green-200" 
    },
    closed: { 
      label: "Closed", 
      color: "bg-gray-100 text-gray-800 border-gray-200" 
    }
  };
  
  return statusMap[status] || { label: status, color: "bg-secondary text-foreground border-border" };
}

// Format ticket priority for display
export function formatPriority(priority: string): { label: string; color: string } {
  const priorityMap: Record<string, { label: string; color: string }> = {
    urgent: { 
      label: "Urgent", 
      color: "bg-red-100 text-red-800 border-red-200" 
    },
    high: { 
      label: "High", 
      color: "bg-orange-100 text-orange-800 border-orange-200" 
    },
    medium: { 
      label: "Medium", 
      color: "bg-yellow-100 text-yellow-800 border-yellow-200" 
    },
    low: { 
      label: "Low", 
      color: "bg-green-100 text-green-800 border-green-200" 
    }
  };
  
  return priorityMap[priority] || { label: priority, color: "bg-secondary text-foreground border-border" };
}

// Calculate priority from impact and urgency
export function calculatePriority(impact: string, urgency: string): string {
  // Map impact and urgency to numerical values
  const impactValue = impact === "high" ? 3 : impact === "medium" ? 2 : 1;
  const urgencyValue = urgency === "high" ? 3 : urgency === "medium" ? 2 : 1;
  
  // Calculate priority score (impact * urgency)
  const priorityScore = impactValue * urgencyValue;
  
  // Map score to priority level
  if (priorityScore >= 7) return "urgent";
  if (priorityScore >= 5) return "high";
  if (priorityScore >= 3) return "medium";
  return "low";
}

// Format subcategory for display
export function formatSubcategory(subCategory: string): string {
  if (!subCategory) return "";
  
  return subCategory
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Generate ticket preview for notifications
export function generateTicketPreview(title: string, maxLength: number = 50): string {
  if (title.length <= maxLength) return title;
  
  return `${title.substring(0, maxLength)}...`;
}
