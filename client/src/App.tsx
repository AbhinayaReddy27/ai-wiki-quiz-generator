import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import GeneratePage from "@/pages/GeneratePage";
import HistoryPage from "@/pages/HistoryPage";
import { cn } from "@/lib/utils";
import { BrainCircuit, BookOpen, History } from "lucide-react";
import generatedImage from '@assets/generated_images/soft_abstract_background_for_educational_app.png';


function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Generate Quiz", icon: BrainCircuit },
    { href: "/history", label: "Past Quizzes", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-serif font-bold text-xl text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
             <BookOpen className="w-5 h-5" />
          </div>
          <span>WikiQuiz<span className="text-blue-600">AI</span></span>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={GeneratePage} />
      <Route path="/history" component={HistoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background font-sans relative selection:bg-blue-100 selection:text-blue-900">
           {/* Background Image Layer */}
           <div 
            className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage: `url(${generatedImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            }}
          />
          
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
              <Router />
            </main>
            <footer className="border-t bg-white/50 backdrop-blur-sm py-6 text-center text-sm text-muted-foreground">
              <div className="container mx-auto px-4">
                <p>© {new Date().getFullYear()} AI Wiki Quiz Generator. Built with React & Tailwind.</p>
              </div>
            </footer>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
