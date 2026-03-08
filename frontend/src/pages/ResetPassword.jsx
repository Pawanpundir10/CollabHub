import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Lock } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Failed to reset password.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border border-border text-center animate-fade-in glass-card">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-6 animate-float">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Password Reset
          </h2>
          <p className="text-muted-foreground mb-8">
            Your password has been successfully reset. You can now use your new password to log in.
          </p>
          <Button onClick={() => navigate("/auth")} size="lg" variant="gradient" className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border border-border animate-fade-in relative overflow-hidden glass-card">

        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-radial from-primary/10 to-transparent blur-3xl opacity-50 -z-10" />

        <div className="flex items-center gap-3 mb-2 animate-fade-in">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            New Password
          </h1>
        </div>

        <p className="text-muted-foreground mb-8 text-sm">
          Please enter your new password below. Make sure it's at least 6 characters.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              New Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

          {status === "error" && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {message}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full shadow-lg hover:shadow-glow transition-all"
            variant="gradient"
            disabled={status === "loading" || !newPassword || !confirmPassword}
          >
            {status === "loading" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Saving...
              </div>
            ) : (
              "Save New Password"
            )}
          </Button>

          <div className="text-center pt-4">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cancel and return to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
