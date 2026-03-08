import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import GroupCard from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Users, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
const Dashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [userMemberships, setUserMemberships] = useState(new Set());
  const [userRequests, setUserRequests] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);
  const fetchData = async () => {
    try {
      // Fetch all groups
      const { data: groupsData } = await api.get("/groups");
      setGroups(groupsData || []);
      // Calculate user memberships from fetched groups
      const memberships = new Set();
      groupsData?.forEach((g) => {
        if (g.members?.some((m) => m === user?.id || m._id === user?.id) || g.owner._id === user?.id) {
          memberships.add(g._id);
        }
      });
      setUserMemberships(memberships);
      // Fetch user's pending requests
      try {
        const { data: requestsData } = await api.get("/groups/me/requests");
        setUserRequests(new Set(requestsData?.map((r) => r.group) || []));
      }
      catch (err) {
        console.warn("Could not fetch requests");
      }
    }
    catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load groups. Please try again.",
        variant: "destructive",
      });
    }
    finally {
      setLoading(false);
    }
  };
  const filteredGroups = groups.filter((group) => {
    const search = searchTerm.toLowerCase();
    const skillsArray = group.skillsRequired || [];
    const name = group.projectName || "";
    const supervisor = group.supervisorName || "";
    return (name.toLowerCase().includes(search) ||
      supervisor.toLowerCase().includes(search) ||
      skillsArray.some((s) => s.toLowerCase().trim().includes(search)));
  });
  if (loading) {
    return (<div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading groups...</p>
        </div>
      </div>
    </div>);
  }
  return (<div className="min-h-screen bg-gradient-subtle">
    <Navbar />

    <main className="container mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight">
            Welcome back, <span className="text-primary">{user?.name || 'Student'}</span>!
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Find your perfect team and start collaborating
          </p>
        </div>
        <Link to="/create-group" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Button variant="gradient" size="lg" className="gap-2 shadow-lg hover:shadow-glow transition-shadow">
            <Plus className="h-5 w-5" />
            Create New Group
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input placeholder="Search by project name, supervisor, or skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 h-14 bg-card/50 backdrop-blur-sm border-border/50 shadow-sm focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 text-lg rounded-xl" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/20 hover:shadow-glow">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">
                {groups.length}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Active Groups</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-accent/20 hover:shadow-glow">
              <Sparkles className="h-7 w-7 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">
                {groups.filter((g) => g.owner._id === user?.id || userMemberships.has(g._id)).length}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Your Groups</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group col-span-2 md:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-warning/20 hover:shadow-glow">
              <Filter className="h-7 w-7 text-warning" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">
                {userRequests.size}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length > 0 ? (<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        {filteredGroups.map((group) => (<GroupCard key={group._id} id={group._id} projectName={group.projectName} supervisorName={group.supervisorName} skillsRequired={group.skillsRequired || []} skillsNeeded={group.skillsNeeded || []} projectOutcomes={group.projectOutcomes || ""} memberCount={group.members?.length || 1} maxMembers={group.maxMembers || 5} ownerName={group.owner?.name || "Unknown"} isOwner={group.owner?._id === user?.id} isMember={userMemberships.has(group._id)} hasRequested={userRequests.has(group._id)} />))}
      </div>) : (<div className="text-center py-20 glass-card rounded-3xl border border-border animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <div className="h-24 w-24 rounded-full bg-secondary text-muted-foreground/50 mx-auto flex items-center justify-center mb-6">
          <Users className="h-12 w-12" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground mb-3">
          {searchTerm ? "No groups found" : "No groups yet"}
        </h3>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          {searchTerm
            ? "Try adjusting your search terms or filters to find what you're looking for."
            : "Be the first to create a project group and start collaborating!"}
        </p>
        {!searchTerm && (<Link to="/create-group">
          <Button variant="gradient" size="lg" className="shadow-lg hover:shadow-glow transition-all">
            <Plus className="h-5 w-5 mr-2" />
            Create Group
          </Button>
        </Link>)}
      </div>)}
    </main>
  </div>);
};
export default Dashboard;
