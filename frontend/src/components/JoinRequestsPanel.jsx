import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Check, X, Clock, UserPlus } from "lucide-react";
const JoinRequestsPanel = ({ groupId, requests, onRequestHandled, }) => {
    const [processing, setProcessing] = useState(null);
    const pendingRequests = requests.filter((r) => r.status === "pending");
    const handleRequest = async (requestId, action) => {
        setProcessing(requestId);
        try {
            await api.patch(`/groups/${groupId}/requests/${requestId}`, {
                status: action,
            });
            toast({
                title: action === "accepted" ? "Request Accepted" : "Request Rejected",
                description: action === "accepted"
                    ? "The user has been added to the group."
                    : "The join request has been rejected.",
            });
            onRequestHandled();
        }
        catch (error) {
            console.error("Error handling request:", error);
            toast({
                title: "Error",
                description: "Failed to process request. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setProcessing(null);
        }
    };
    if (pendingRequests.length === 0) {
        return (<div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-primary"/>
          <h3 className="font-semibold text-foreground">Join Requests</h3>
        </div>
        <div className="text-center py-8">
          <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3"/>
          <p className="text-muted-foreground">No pending requests</p>
        </div>
      </div>);
    }
    return (<div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary"/>
          <h3 className="font-semibold text-foreground">Join Requests</h3>
        </div>
        <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full">
          {pendingRequests.length} pending
        </span>
      </div>

      <div className="space-y-3">
        {pendingRequests.map((request) => {
            const profile = request.user;
            return (<div key={request._id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="font-medium text-foreground">
                  {profile?.name || "Unknown"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile?.email || "No email"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={() => handleRequest(request._id, "accepted")} disabled={processing === request._id}>
                  <Check className="h-4 w-4"/>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleRequest(request._id, "rejected")} disabled={processing === request._id}>
                  <X className="h-4 w-4"/>
                </Button>
              </div>
            </div>);
        })}
      </div>
    </div>);
};
export default JoinRequestsPanel;
