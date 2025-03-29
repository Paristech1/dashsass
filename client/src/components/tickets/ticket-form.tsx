import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { InsertTicket } from "@shared/schema";
import { useAuth } from "@/context/auth-context";

// Create ticket schema with validation rules
const ticketFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).max(100),
  description: z.string().optional(),
  status: z.string().default("open"),
  priority: z.string().default("medium"),
  category: z.string().min(1, { message: "Category is required" }),
  subCategory: z.string().optional(),
  impact: z.string().default("medium"),
  urgency: z.string().default("medium"),
  assignedToId: z.number().optional().nullable(),
  reportedById: z.number(),
  configurationItem: z.string().optional().nullable(),
  callerLocation: z.string().optional().nullable(),
  issueLocation: z.string().optional().nullable(),
  preferredContact: z.string().optional().nullable(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  onSuccess?: () => void;
}

export function TicketForm({ onSuccess }: TicketFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [subCategories, setSubCategories] = useState<string[]>([]);
  
  // Query to fetch users for assignment
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Form setup with default values
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "open",
      priority: "medium",
      category: "",
      subCategory: "",
      impact: "medium",
      urgency: "medium",
      assignedToId: null,
      reportedById: user?.id || 4, // Default to current user or sample user if not logged in
      configurationItem: "",
      callerLocation: "",
      issueLocation: "",
      preferredContact: "none",
    },
  });

  // Handle category change to update subcategories
  const handleCategoryChange = (value: string) => {
    form.setValue("category", value);
    form.setValue("subCategory", ""); // Reset subcategory when category changes
    
    // Set subcategories based on selected category
    switch (value) {
      case "software":
        setSubCategories([
          "software-installation",
          "software-update",
          "software-error",
          "license"
        ]);
        break;
      case "hardware":
        setSubCategories([
          "computer",
          "printer",
          "network-device",
          "peripherals"
        ]);
        break;
      case "network":
        setSubCategories([
          "connectivity",
          "vpn",
          "wifi",
          "bandwidth"
        ]);
        break;
      case "security":
        setSubCategories([
          "access-control",
          "data-breach",
          "policy-violation",
          "virus-malware"
        ]);
        break;
      case "other":
        setSubCategories([
          "inquiry",
          "request",
          "feedback"
        ]);
        break;
      default:
        setSubCategories([]);
    }
  };

  // Calculate priority based on impact and urgency
  useEffect(() => {
    const impact = form.watch("impact");
    const urgency = form.watch("urgency");
    
    // Map impact and urgency to numerical values
    const impactValue = impact === "high" ? 3 : impact === "medium" ? 2 : 1;
    const urgencyValue = urgency === "high" ? 3 : urgency === "medium" ? 2 : 1;
    
    // Calculate priority score
    const priorityScore = impactValue * urgencyValue;
    
    // Set priority based on score
    let priority;
    if (priorityScore >= 7) {
      priority = "urgent";
    } else if (priorityScore >= 5) {
      priority = "high";
    } else if (priorityScore >= 3) {
      priority = "medium";
    } else {
      priority = "low";
    }
    
    form.setValue("priority", priority);
  }, [form.watch("impact"), form.watch("urgency")]);

  // Submit handler
  const onSubmit = async (data: TicketFormValues) => {
    try {
      await apiRequest("POST", "/api/tickets", data);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      
      toast({
        title: "Ticket Created",
        description: "Your ticket has been successfully created",
        variant: "default",
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/tickets");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Category and Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                <Select
                  onValueChange={(value) => handleCategoryChange(value)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Select a category</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!form.getValues("category")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sub category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Select a sub category</SelectItem>
                    {subCategories.map((subCategory) => (
                      <SelectItem key={subCategory} value={subCategory}>
                        {subCategory
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Configuration Item and Caller */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="configurationItem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Configuration Item</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Search configuration items..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reportedById"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caller <span className="text-red-500">*</span></FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select caller" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location of Caller and Issue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="callerLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location of Caller</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter location..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="issueLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location of Issue</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter location..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Preferred Contact */}
        <FormField
          control={form.control}
          name="preferredContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Contact</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred contact method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">-- None --</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="inPerson">In Person</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Impact, Urgency and Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="impact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impact <span className="text-red-500">*</span></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select impact" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">1 - High</SelectItem>
                    <SelectItem value="medium">2 - Medium</SelectItem>
                    <SelectItem value="low">3 - Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="urgency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgency <span className="text-red-500">*</span></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">1 - High</SelectItem>
                    <SelectItem value="medium">2 - Medium</SelectItem>
                    <SelectItem value="low">3 - Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel>Priority</FormLabel>
            <div className="flex items-center justify-between bg-gray-100 px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 mt-2">
              <span className="capitalize">{form.watch("priority")}</span>
              <PriorityBadge priority={form.watch("priority")} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Auto-calculated based on impact and urgency</p>
          </div>
        </div>

        {/* Short Description and Description */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Brief summary of the issue..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the issue..."
                  rows={4}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Attachment Field */}
        <div>
          <FormLabel htmlFor="attachments">Attachments</FormLabel>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate("/tickets")}>
            Cancel
          </Button>
          <Button type="submit">Create Ticket</Button>
        </div>
      </form>
    </Form>
  );
}

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  const priorityColors: { [key: string]: string } = {
    urgent: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[priority] || "bg-gray-100 text-gray-800"}`}>
      {priority === "urgent" ? "1" : priority === "high" ? "2" : priority === "medium" ? "3" : "4"}
    </span>
  );
}
