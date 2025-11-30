import { ChatInterface } from "@/components/chat-interface";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-muted/20">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-4xl flex flex-col gap-8 items-center py-8">
        <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Startup Blueprint</h1>
            <p className="text-muted-foreground">Validate your B2B SaaS idea and generate a PRD & Landing Page in minutes.</p>
        </div>
        
        <ChatInterface />
      </div>
    </main>
  );
}
