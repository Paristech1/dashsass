import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Ticket, Comment, ActivityLog } from "@shared/schema";
import { useAuth } from "@/context/auth-context";
import { 
  ArrowLeftIcon, 
  Clock, 
  Calendar, 
  User, 
  Tag, 
  MessageSquare, 
  FileText, 
  Activity,
  PaperclipIcon,
  AlertCircle
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TicketDetailProps {
  ticketId: string | number;
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch ticket details
  const {
    data: ticket,
    isLoading: isLoadingTicket,
    error: ticketError,
  } = useQuery<Ticket>({
    queryKey: [`/api/tickets/${ticketId}`],
  });

  // Fetch ticket comments
  const {
    data: comments,
    isLoading: isLoadingComments,
  } = useQuery<Comment[]>({
    queryKey: [`/api/tickets/${ticketId}/comments`],
    enabled: !!ticketId,
  });

  // Fetch ticket activity logs
  const {
    data: activityLogs,
    isLoading: isLoadingActivity,
  } = useQuery<ActivityLog[]>({
    queryKey: [`/api/tickets/${ticketId}/activity`],
    enabled: !!ticketId,
  });

  // Update selected status when ticket data is loaded
  useEffect(() => {
    if (ticket) {
      setSelectedStatus(ticket.status);
    }
  }, [ticket]);

  // WebSocket event listener for real-time updates
  useEffect(() => {
    const handleTicketUpdate = (event: CustomEvent) => {
      const { data, action } = event.detail;
      if ((action === 'update' || action === 'create') && data.id === Number(ticketId)) {
        queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}`] });
      }
    };

    const handleCommentUpdate = (event: CustomEvent) => {
      const { data } = event.detail;
      if (data.ticketId === Number(ticketId)) {
        queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}/comments`] });
      }
    };

    window.addEventListener('ticket-update', handleTicketUpdate as EventListener);
    window.addEventListener('comment-update', handleCommentUpdate as EventListener);

    return () => {
      window.removeEventListener('ticket-update', handleTicketUpdate as EventListener);
      window.removeEventListener('comment-update', handleCommentUpdate as EventListener);
    };
  }, [ticketId]);

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentData: { content: string; ticketId: number; userId: number; isInternal: boolean }) => {
      return apiRequest("POST", `/api/tickets/${ticketId}/comments`, commentData);
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}/comments`] });
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the ticket",
      });
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Upload attachments mutation
  const uploadAttachmentsMutation = useMutation({
    mutationFn: async (data: { files: Array<{ name: string; size: number; type: string }>; userId: number }) => {
      return apiRequest("POST", `/api/tickets/${ticketId}/attachments`, data);
    },
    onSuccess: () => {
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}/activity`] });
      toast({
        title: "Files Uploaded",
        description: "Your files have been attached to the ticket",
      });
    },
    onError: (error) => {
      console.error("Error uploading files:", error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update ticket status mutation
  const updateTicketStatusMutation = useMutation({
    mutationFn: async (statusData: { status: string; updatedById: number }) => {
      return apiRequest("PATCH", `/api/tickets/${ticketId}`, statusData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/status-breakdown'] });
      toast({
        title: "Status Updated",
        description: "Ticket status has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle comment submission
  const handleSubmitComment = () => {
    const hasComment = newComment.trim().length > 0;
    const hasFiles = selectedFiles.length > 0;
    
    // If neither comment nor files, do nothing
    if (!hasComment && !hasFiles) return;
    
    // Add comment if there's text
    if (hasComment) {
      addCommentMutation.mutate({
        content: newComment,
        ticketId: Number(ticketId),
        userId: user?.id || 1, // Default to first user if not logged in
        isInternal: isInternalComment,
      });
    }
    
    // Upload files if any are selected
    if (hasFiles) {
      // Prepare files info for upload - we don't actually send the file data in this mock implementation
      // In a real app, you'd use FormData to upload the actual files
      const filesInfo = selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      uploadAttachmentsMutation.mutate({
        files: filesInfo,
        userId: user?.id || 1, // Default to first user if not logged in
      });
    }
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    // If status is resolved or closed, show confirmation dialog
    if (status === 'resolved' || status === 'closed') {
      setPendingStatus(status);
      setShowStatusConfirmation(true);
    } else {
      // Otherwise update immediately
      setSelectedStatus(status);
      updateTicketStatusMutation.mutate({
        status,
        updatedById: user?.id || 1, // Default to first user if not logged in
      });
    }
  };
  
  // Confirm status change
  const confirmStatusChange = () => {
    if (pendingStatus) {
      setSelectedStatus(pendingStatus);
      updateTicketStatusMutation.mutate({
        status: pendingStatus,
        updatedById: user?.id || 1, // Default to first user if not logged in
      });
      setShowStatusConfirmation(false);
      setPendingStatus(null);
    }
  };
  
  // Cancel status change
  const cancelStatusChange = () => {
    setShowStatusConfirmation(false);
    setPendingStatus(null);
  };
  
  // Handle file selection
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      
      // Show toast notification for selected files
      toast({
        title: "Files Selected",
        description: `${filesArray.length} file(s) selected for upload`
      });
    }
  };

  if (isLoadingTicket) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ticketError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Ticket</h2>
            <p className="text-gray-500 mb-4">Unable to load ticket details. Please try again later.</p>
            <Button onClick={() => navigate("/tickets")}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Tickets
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ticket) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
            <p className="text-gray-500 mb-4">The ticket you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/tickets")}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Tickets
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Update Confirmation Dialog */}
      <AlertDialog open={showStatusConfirmation} onOpenChange={setShowStatusConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Confirm Status Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the ticket status to 
              <span className="font-semibold mx-1 capitalize">{pendingStatus}</span>?
              This will effectively {pendingStatus === 'resolved' 
                ? 'mark the ticket as resolved for the customer' 
                : 'close the ticket and prevent further updates'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelStatusChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Yes, Change Status</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/tickets")}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedStatus}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{ticket.title}</CardTitle>
              <p className="text-gray-500 text-sm mt-1">{ticket.ticketNumber}</p>
            </div>
            <PriorityBadge priority={ticket.priority} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ticket details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created
                </h3>
                <p className="mt-1">{formatDate(ticket.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Last Updated
                </h3>
                <p className="mt-1">{formatDate(ticket.updatedAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Reported By
                </h3>
                <p className="mt-1">
                  <UserDisplay userId={ticket.reportedById} />
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Assigned To
                </h3>
                <p className="mt-1">
                  {ticket.assignedToId ? (
                    <UserDisplay userId={ticket.assignedToId} />
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Category
                </h3>
                <p className="mt-1 capitalize">
                  {ticket.category || "Uncategorized"}
                  {ticket.subCategory && ` > ${formatSubcategory(ticket.subCategory)}`}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Impact / Urgency
                </h3>
                <p className="mt-1 capitalize">
                  {ticket.impact || "Medium"} / {ticket.urgency || "Medium"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Configuration Item
                </h3>
                <p className="mt-1">
                  {ticket.configurationItem || <span className="text-gray-400">None specified</span>}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Location
                </h3>
                <p className="mt-1">
                  {ticket.issueLocation || ticket.callerLocation || <span className="text-gray-400">None specified</span>}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Preferred Contact
                </h3>
                <p className="mt-1 capitalize">
                  {ticket.preferredContact || <span className="text-gray-400">None specified</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Description
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              {ticket.description ? (
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              ) : (
                <p className="text-gray-400">No description provided</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingComments ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className={`flex space-x-4 ${comment.isInternal ? 'bg-amber-50 p-3 rounded-md' : ''}`}>
                  <UserAvatar userId={comment.userId} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <UserName userId={comment.userId} />
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                      {comment.isInternal && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                          Internal
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          )}

          {/* Add Comment Form */}
          <div className="mt-6">
            <Textarea
              placeholder="Add a comment..."
              className="min-h-[100px] mb-2"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="space-y-3">
              {/* Selected files display */}
              {selectedFiles.length > 0 && (
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                  <h4 className="text-sm font-medium mb-1">Selected Files:</h4>
                  <ul className="text-xs text-gray-600">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between py-1">
                        <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                        >
                          ×
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="internal-comment"
                    checked={isInternalComment}
                    onChange={(e) => setIsInternalComment(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="internal-comment" className="text-sm text-gray-600">
                    Mark as internal comment
                  </label>
                </div>
                <div className="flex space-x-2">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*, application/pdf"
                  />
                  <Button variant="outline" onClick={handleFileSelect}>
                    <PaperclipIcon className="h-4 w-4 mr-2" /> Attach Files
                  </Button>
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={(selectedFiles.length === 0 && !newComment.trim()) || 
                             addCommentMutation.isPending || 
                             uploadAttachmentsMutation.isPending}
                  >
                    {addCommentMutation.isPending || uploadAttachmentsMutation.isPending ? 
                      "Submitting..." : 
                      selectedFiles.length > 0 && !newComment.trim() ? 
                        "Upload Files" : "Submit"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingActivity ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 w-4 mt-1 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : activityLogs && activityLogs.length > 0 ? (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex space-x-3 text-sm">
                  <div className="h-2 w-2 mt-1.5 bg-gray-400 rounded-full"></div>
                  <div>
                    <span className="font-medium"><UserName userId={log.userId} /></span>
                    <span className="text-gray-600"> {formatActivityAction(log.action)} </span>
                    <span className="text-gray-500 text-xs">
                      ({formatDate(log.createdAt)})
                    </span>
                    {log.action === "updated" && typeof log.details === 'object' && (
                      <div className="ml-5 mt-1 text-xs text-gray-600">
                        {formatActivityDetails(log.details as any)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No activity recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components and Functions

function StatusBadge({ status }: { status: string }) {
  const statusColors: { [key: string]: string } = {
    open: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-purple-100 text-purple-800 border-purple-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    closed: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const displayNames: { [key: string]: string } = {
    open: "Open",
    in_progress: "In Progress",
    pending: "Pending",
    resolved: "Resolved",
    closed: "Closed",
  };

  return (
    <Badge 
      variant="outline" 
      className={`${statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
    >
      {displayNames[status] || status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityColors: { [key: string]: string } = {
    urgent: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <Badge 
      variant="outline" 
      className={`${priorityColors[priority] || "bg-gray-100 text-gray-800 border-gray-200"} capitalize`}
    >
      {priority}
    </Badge>
  );
}

function UserDisplay({ userId }: { userId: number }) {
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const user = users.find((u: any) => u.id === userId);
  
  if (!user) {
    return <span>User #{userId}</span>;
  }
  
  return (
    <div className="flex items-center">
      <Avatar className="h-5 w-5 mr-2">
        <AvatarImage src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0D8ABC&color=fff`} />
        <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span>{user.fullName}</span>
    </div>
  );
}

function UserAvatar({ userId }: { userId: number }) {
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
    staleTime: 5 * 60 * 1000,
  });

  const user = users.find((u: any) => u.id === userId);
  
  return (
    <Avatar className="h-10 w-10">
      <AvatarImage 
        src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=0D8ABC&color=fff`} 
        alt={user?.fullName || `User #${userId}`}
      />
      <AvatarFallback>
        {user?.fullName?.substring(0, 2).toUpperCase() || `U${userId}`}
      </AvatarFallback>
    </Avatar>
  );
}

function UserName({ userId }: { userId: number }) {
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
    staleTime: 5 * 60 * 1000,
  });

  const user = users.find((u: any) => u.id === userId);
  const name = user?.fullName || `User #${userId}`;
  
  return <>{name}</>;
}

function formatDate(timestamp: string | Date | null): string {
  if (!timestamp) return "N/A";
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

function formatSubcategory(subCategory: string): string {
  return subCategory
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatActivityAction(action: string): string {
  switch (action) {
    case "created":
      return "created the ticket";
    case "updated":
      return "updated the ticket";
    case "commented":
      return "added a comment";
    default:
      return action;
  }
}

function formatActivityDetails(details: Record<string, {from: any, to: any}> | null | undefined): JSX.Element {
  if (!details || typeof details !== 'object') {
    return <></>;
  }

  return (
    <>
      {Object.entries(details).map(([field, change]: [string, {from: any, to: any}]) => (
        <div key={field}>
          Changed <span className="font-medium">{formatFieldName(field)}</span> from{" "}
          <span className="font-medium">{formatFieldValue(change.from)}</span> to{" "}
          <span className="font-medium">{formatFieldValue(change.to)}</span>
        </div>
      ))}
    </>
  );
}

function formatFieldName(field: string): string {
  // Convert camelCase to words with spaces
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}

function formatFieldValue(value: any): string {
  if (value === null || value === undefined) {
    return "None";
  }
  
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  
  if (typeof value === "object" && value instanceof Date) {
    return format(value, "MMM d, yyyy");
  }
  
  return String(value);
}
