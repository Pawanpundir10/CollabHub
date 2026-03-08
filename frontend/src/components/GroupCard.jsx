import { Link } from "react-router-dom";
import { Users, User, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const GroupCard = ({ id, projectName, supervisorName, skillsRequired, skillsNeeded, projectOutcomes, memberCount, maxMembers, ownerName, isOwner, isMember, hasRequested, }) => {
  return (
    <div className="group relative glass-card rounded-2xl border border-border shadow-md hover:shadow-xl hover:border-primary/50 transition-all duration-500 overflow-hidden hover:-translate-y-2">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-primary group-hover:shadow-glow transition-all duration-500" />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-display font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {projectName}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>Supervised by {supervisorName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            <Users className="h-3.5 w-3.5" />
            <span>
              {memberCount}/{maxMembers}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {projectOutcomes || "No description provided"}
        </p>

        {/* Skills */}
        <div className="space-y-2">
          {skillsRequired.length > 0 && (<div className="flex flex-wrap gap-2">
            {skillsRequired.slice(0, 3).map((skill, index) => (<Badge key={index} variant="secondary" className="px-2.5 py-0.5 text-xs font-medium bg-secondary/80 hover:bg-secondary">
              {skill}
            </Badge>))}
            {skillsRequired.length > 3 && (<Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium border-primary/20 text-primary">
              +{skillsRequired.length - 3} more
            </Badge>)}
          </div>)}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Created by {ownerName}</span>
          </div>

          <Link to={`/group/${id}`}>
            <Button variant={isOwner
              ? "default"
              : isMember
                ? "secondary"
                : hasRequested
                  ? "outline"
                  : "gradient"} size="sm" className="gap-1 shadow-sm hover:shadow-md transition-shadow">
              {isOwner
                ? "Manage"
                : isMember
                  ? "View Chat"
                  : hasRequested
                    ? "Pending"
                    : "View"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>);
};
export default GroupCard;
