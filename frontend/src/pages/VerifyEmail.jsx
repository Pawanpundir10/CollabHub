import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus("error");
                setErrorMessage("Invalid verification link.");
                return;
            }

            try {
                await api.post("/auth/verify-email", { token });
                setStatus("success");
            } catch (err) {
                setStatus("error");
                setErrorMessage(
                    err.response?.data?.error || "Failed to verify email. The link may have expired."
                );
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border border-border text-center animate-fade-in relative overflow-hidden glass-card">

                {/* Background Decorative Glow */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-radial from-primary/10 to-transparent blur-3xl opacity-50 -z-10" />

                <div className="mb-6 flex justify-center">
                    {status === "verifying" && (
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        </div>
                    )}
                    {status === "success" && (
                        <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center animate-float">
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        </div>
                    )}
                    {status === "error" && (
                        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-destructive" />
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-display font-bold text-foreground mb-4">
                    {status === "verifying" && "Verifying Email"}
                    {status === "success" && "Email Verified!"}
                    {status === "error" && "Verification Failed"}
                </h1>

                <p className="text-muted-foreground text-lg mb-8">
                    {status === "verifying" && "Please wait while we confirm your email address..."}
                    {status === "success" && "Your email has been successfully verified. You can now log into your account."}
                    {status === "error" && errorMessage}
                </p>

                {(status === "success" || status === "error") && (
                    <Button asChild size="lg" variant="gradient" className="w-full">
                        <Link to="/auth">
                            Continue to Login <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
