import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import ChatBox from "@/components/ChatBox";
import JoinRequestsPanel from "@/components/JoinRequestsPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { ArrowLeft, Users, User, Target, CheckCircle2, XCircle, UserPlus, Trash2, Clock, LogOut } from "lucide-react";
import { format } from "date-fns";
const GroupDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Profile map for ChatBox (since it prefers a simple Record of id -> name)
  const profilesMap = {};
  if (group) {
    profilesMap[group.owner._id] = group.owner.name;
    group.members.forEach((m) => {
      profilesMap[m._id] = m.name;
    });
  }
  const isOwner = group?.owner?._id === user?.id;
  const isMember = group?.members?.some((m) => m._id === user?.id) || isOwner;
  // Fallback to fetch from me/requests if not owner, since user request won't be in owner's fetch
  const [userRequestStatus, setUserRequestStatus] = useState(null);
  useEffect(() => {
    if (id)
      fetchData();
  }, [id]);
  const fetchData = async () => {
    try {
      // Fetch group details
      const { data: groupData } = await api.get(`/groups/${id}`);
      setGroup(groupData);
      // Group owner gets all requests
      if (groupData?.owner?._id === user?.id) {
        try {
          const { data: requestsData } = await api.get(`/groups/${id}/requests`);
          setRequests(requestsData || []);
        }
        catch (err) {
          console.error("Error fetching requests", err);
        }
      }
      else if (user) {
        // Normal user checks their own requests status
        try {
          const { data: myReqs } = await api.get(`/groups/me/requests`);
          const myReqForThisGroup = myReqs.find((r) => r.group === id);
          if (myReqForThisGroup) {
            setUserRequestStatus(myReqForThisGroup.status);
          }
          else {
            setUserRequestStatus(null);
          }
        }
        catch (err) {
          console.error("Error fetching my requests", err);
        }
      }
    }
    catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Group not found or error loading",
        description: "This group doesn't exist or has been deleted.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
    finally {
      setLoading(false);
    }
  };
  const handleJoinRequest = async () => {
    if (!group || !user)
      return;
    setRequesting(true);
    try {
      await api.post(`/groups/${group._id}/request`);
      toast({
        title: "Request Sent!",
        description: "Your join request has been sent to the group owner.",
      });
      setUserRequestStatus("pending");
      fetchData();
    }
    catch (error) {
      console.error("Error sending request:", error);
      const msg = error.response?.data?.error || "Failed to send join request.";
      toast({
        title: msg === "Join request already pending" ? "Already Requested" : "Error",
        description: msg,
        variant: msg === "Join request already pending" ? "default" : "destructive",
      });
    }
    finally {
      setRequesting(false);
    }
  };
  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/groups/${group._id}/members/${memberId}`);
      toast({
        title: "Member Removed",
        description: "The member has been removed from the group.",
      });
      fetchData();
    }
    catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive",
      });
    }
  };
  const handleDeleteGroup = async () => {
    if (!group)
      return;
    setDeleting(true);
    try {
      await api.delete(`/groups/${group._id}`);
      toast({
        title: "Group Deleted",
        description: "The group has been successfully deleted.",
      });
      navigate("/dashboard");
    }
    catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: "Failed to delete group.",
        variant: "destructive",
      });
    }
    finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    setLeaving(true);
    try {
      await api.post(`/groups/${group._id}/leave`);
      toast({
        title: "Left Group",
        description: "You have successfully left the project.",
      });
      navigate("/dashboard");
    }
    catch (error) {
      console.error("Error leaving group:", error);
      const msg = error.response?.data?.error || "Failed to leave group.";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
    finally {
      setLeaving(false);
    }
  };
  if (loading) {
    return (<div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </div>
    </div>);
  }
  if (!group)
    return null;
  const hasRequestedPending = userRequestStatus === "pending";
  const wasRejected = userRequestStatus === "rejected";
  const memberCount = group.members.length;
  return (<div className="min-h-screen bg-gradient-subtle">
    <Navbar />

    <main className="container mx-auto px-4 py-8">
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="h-2 bg-gradient-primary" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    {group.projectName}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Supervised by {group.supervisorName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary">
                  <Users className="h-4 w-4 text-secondary-foreground" />
                  <span className="font-semibold text-secondary-foreground">
                    {memberCount}/{group.maxMembers}
                  </span>
                </div>
              </div>

              {group.outcomeType && (
                <div className="mb-4">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors">
                    <Target className="h-3.5 w-3.5 mr-1" />
                    Target Outcome: {group.outcomeType}
                  </Badge>
                </div>
              )}

              {group.projectOutcomes && (<div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">
                    Project Outcomes
                  </span>
                </div>
                <p className="text-muted-foreground">{group.projectOutcomes}</p>
              </div>)}

              {/* Skills */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {group.skillsRequired && group.skillsRequired.length > 0 && (<div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Skills Required
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.skillsRequired.map((skill, i) => (<Badge key={i} variant="secondary">
                      {skill.trim()}
                    </Badge>))}
                  </div>
                </div>)}
                {group.skillsNeeded && group.skillsNeeded.length > 0 && (<div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Skills Needed
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.skillsNeeded.map((skill, i) => (<Badge key={i} variant="outline" className="border-accent text-accent">
                      {skill.trim()}
                    </Badge>))}
                  </div>
                </div>)}
              </div>

              {/* Action buttons */}
              {!isOwner &&
                !isMember &&
                !hasRequestedPending &&
                !wasRejected && (<Button variant="gradient" size="lg" className="w-full sm:w-auto" onClick={handleJoinRequest} disabled={requesting}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {requesting ? "Sending..." : "Request to Join"}
                </Button>)}

              {hasRequestedPending && (<div className="flex items-center gap-2 text-warning">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  Your request is pending approval
                </span>
              </div>)}

              {wasRejected && (<div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">
                  Your request was declined
                </span>
              </div>)}

              {isMember && !isOwner && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">
                      You're a member of this group
                    </span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleLeaveGroup} disabled={leaving}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {leaving ? "Leaving..." : "Leave Group"}
                  </Button>
                </div>
              )}

              {isOwner && (<Button variant="destructive" size="lg" className="w-full sm:w-auto mt-4" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Group
              </Button>)}

              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Created {format(new Date(group.createdAt), "PPP")}
                </span>
              </div>
            </div>
          </div>

          {/* Chat - only for members */}
          {isMember && <ChatBox groupId={group._id} profiles={profilesMap} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Members List */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Team Members</h3>
            </div>

            <div className="space-y-3">
              {/* Owner */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {group.owner?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {group.owner?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">Owner</p>
                  </div>
                </div>
              </div>

              {/* Members */}
              {group.members.filter(m => m._id !== group.owner._id).map((member) => (<div key={member._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                    {member.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {member.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">Member</p>
                  </div>
                </div>
                {isOwner && (<Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member._id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>)}
              </div>))}
            </div>
          </div>

          {/* Join Requests - only for owner */}
          {isOwner && (<JoinRequestsPanel groupId={group._id} requests={requests} profiles={{}} // We'll pass the whole request objects which have populated users instead of a separate profiles map
            onRequestHandled={fetchData} />)}
        </div>
      </div>
    </main>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Group</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete this group? This action cannot be
          undone. All members will be removed and all group data will be
          permanently deleted.
        </AlertDialogDescription>
        <div className="flex justify-end gap-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteGroup} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
            {deleting ? "Deleting..." : "Delete Group"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  </div>);
};
export default GroupDetail;
