import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KbArticle } from "@shared/schema";
import { BookOpen, Search, Plus, BookOpenCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("published");
  
  // Fetch knowledge base articles
  const { data: articles, isLoading } = useQuery<KbArticle[]>({
    queryKey: [`/api/kb-articles?published=${activeTab === 'published'}`],
  });
  
  // Filter articles based on search query and category
  const filteredArticles = articles?.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || 
      article.categoryId?.toString() === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
          <BookOpen className="mr-2 h-6 w-6" />
          Knowledge Base
        </h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full md:w-60">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="1">Getting Started</SelectItem>
                <SelectItem value="2">Troubleshooting</SelectItem>
                <SelectItem value="3">Network Issues</SelectItem>
                <SelectItem value="4">Software</SelectItem>
                <SelectItem value="5">Hardware</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="published" className="flex items-center">
                <BookOpenCheck className="mr-2 h-4 w-4" />
                Published
              </TabsTrigger>
              <TabsTrigger value="drafts" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Drafts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="published" className="mt-0">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-md">
                      <div className="h-5 bg-secondary rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-secondary rounded w-full mb-2"></div>
                      <div className="h-4 bg-secondary rounded w-2/3"></div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="h-4 bg-secondary rounded w-20"></div>
                        <div className="h-4 bg-secondary rounded w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredArticles && filteredArticles.length > 0 ? (
                <div className="space-y-4">
                  {filteredArticles.map(article => (
                    <div key={article.id} className="p-4 border rounded-md hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card">
                      <h3 className="font-medium text-lg text-foreground">{article.title}</h3>
                      <p className="text-muted-foreground line-clamp-2 mt-1">
                        {article.content.substring(0, 200)}
                        {article.content.length > 200 ? '...' : ''}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Category: {getCategoryName(article.categoryId)}
                        </span>
                        <span className="text-muted-foreground">
                          Updated {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground">No articles found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchQuery || categoryFilter !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "Start by creating your first knowledge base article"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="drafts" className="mt-0">
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">No draft articles</h3>
                <p className="text-muted-foreground mt-2">Draft articles will appear here</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Article
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get category name from ID
function getCategoryName(categoryId: number | null | undefined): string {
  if (!categoryId) return "Uncategorized";
  
  const categories: { [key: number]: string } = {
    1: "Getting Started",
    2: "Troubleshooting",
    3: "Network Issues",
    4: "Software",
    5: "Hardware",
  };
  
  return categories[categoryId] || "Uncategorized";
}
