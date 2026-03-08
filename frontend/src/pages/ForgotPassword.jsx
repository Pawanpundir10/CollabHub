import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        try {
            const { data } = await api.post("/auth/forgot-password", { email });
            setStatus("success");
            setMessage(data.message);
        } catch (err) {
            setStatus("error");
            setMessage(err.response?.data?.error || "Failed to process request");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border border-border animate-fade-in relative overflow-hidden glass-card">

                {/* Glow Element */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-radial from-primary/10 to-transparent blur-3xl opacity-50 -z-10" />

                <Link
                    to="/auth"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                </Link>

                <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                    Forgot Password
                </h1>
                <p className="text-muted-foreground mb-8">
                    Enter your email address and we'll send you a secure link to reset your
                    password.
                </p>

                {status === "success" ? (
                    <div className="text-center py-6 animate-slide-up">
                        <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                            <Mail className="h-8 w-8 text-success" />
                        </div>
                        <p className="text-foreground font-medium mb-2">Check your email</p>
                        <p className="text-muted-foreground text-sm">{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>

                        {status === "error" && (
                            <p className="text-sm text-destructive">{message}</p>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full shadow-lg hover:shadow-glow transition-all"
                            variant="gradient"
                            disabled={status === "loading" || !email}
                        >
                            {status === "loading" ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" /> Sending Link...
                                </div>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
