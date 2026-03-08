import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, MessageCircle, Sparkles, ArrowRight, CheckCircle2, } from "lucide-react";
import Navbar from "@/components/Navbar";
const Index = () => {
  const { user } = useAuth();
  const features = [
    {
      icon: Users,
      title: "Find Your Team",
      description: "Browse project groups looking for members with your skills and interests.",
    },
    {
      icon: Sparkles,
      title: "Create Groups",
      description: "Start your own project group and recruit talented students to join.",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Communicate instantly with your team through built-in group messaging.",
    },
  ];
  const benefits = [
    "Connect with students who share your interests",
    "Find projects that match your skill set",
    "Build your portfolio with collaborative work",
    "Learn from peers in a supportive environment",
  ];
  return (<div className="min-h-screen bg-background selection:bg-primary/30">
    <Navbar />

    {/* Hero Section */}
    <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-hero animate-pulse-slow" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 mix-blend-overlay" />

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-float -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-float-delayed -z-10" />

      <div className="relative container mx-auto px-4 py-24 md:py-32 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-10 animate-fade-in hover:bg-white/20 transition-all duration-300 shadow-lg glow-spin cursor-default">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-sm font-medium text-white tracking-wide">
              The future of student collaboration
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white leading-tight mb-8 animate-slide-up tracking-tight">
            Connect, Collaborate,
            <br />
            <span className="text-gradient bg-gradient-to-r from-accent to-white">
              Create Together
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: "0.1s" }}>
            Find your perfect project group, team up with skilled students,
            and bring your academic projects to life through seamless
            collaboration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up relative z-20" style={{ animationDelay: "0.2s" }}>
            {user ? (<Button asChild variant="gradient" size="xl">
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>) : (<>
              <Button asChild variant="gradient" size="xl">
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                <Link to="/auth">Sign In</Link>
              </Button>
            </>)}
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Why Students Love Collab Hub
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for student collaboration and project
            management.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (<div key={feature.title} className="group p-8 rounded-2xl bg-card border border-border shadow-md hover:shadow-xl hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 glass-card" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-110">
              <feature.icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-4">
              {feature.title}
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
          </div>))}
        </div>
      </div>
    </section>

    {/* Benefits Section */}
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
              Why Students Love Collab Hub
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of students who are already using Collab Hub to
              make their academic life easier and more productive.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (<div key={index} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-card rounded-2xl border border-border shadow-card p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Collab Hub
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Student Collaboration Platform
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-3 bg-secondary rounded-full w-full" />
                <div className="h-3 bg-secondary rounded-full w-4/5" />
                <div className="h-3 bg-secondary rounded-full w-3/5" />
              </div>
              <div className="mt-6 flex gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20" />
                <div className="h-8 w-8 rounded-full bg-accent/20 -ml-2" />
                <div className="h-8 w-8 rounded-full bg-success/20 -ml-2" />
                <span className="text-sm text-muted-foreground ml-2 self-center">
                  +50 students
                </span>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 bg-gradient-primary rounded-2xl opacity-10 blur-xl" />
            <div className="absolute -bottom-4 -left-4 h-20 w-20 bg-accent rounded-full opacity-10 blur-xl" />
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-primary/20 via-transparent to-transparent opacity-50 blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-accent/20 via-transparent to-transparent opacity-50 blur-[80px] -z-10" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-gradient-hero rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl glass border border-white/10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVctIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30 mix-blend-overlay" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Join Collab Hub today and discover the power of student
              collaboration!
            </h2>
            <Button asChild variant="gradient" size="xl" className="bg-accent hover:bg-accent/90">
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-2xl font-display font-bold text-foreground">
              Collab Hub
            </span>
          </div>
          <p className="text-muted-foreground text-sm flex-1 text-center md:text-left">
            © 2024 Collab Hub. Built for students, by Pawan Pundir.
          </p>
        </div>
      </div>
    </footer>
  </div>);
};
export default Index;
