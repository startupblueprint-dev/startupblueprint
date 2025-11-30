"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, ArrowRight, Download, Loader2, FileText, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "model";
  content: string;
  prdContent?: string;
  landingPageContent?: string;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "What industry or professional field do you have the most experience in?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on load and after loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const extractFiles = (text: string) => {
    let prdContent: string | undefined;
    let landingPageContent: string | undefined;
    let displayContent = text;

    // Extract PRD
    const prdMatch = text.match(/<PRD_FILE>([\s\S]*?)<\/PRD_FILE>/);
    if (prdMatch) {
      prdContent = prdMatch[1].trim();
      displayContent = displayContent.replace(prdMatch[0], "");
    }

    // Extract Landing Page
    const lpMatch = text.match(/<LANDING_PAGE_FILE>([\s\S]*?)<\/LANDING_PAGE_FILE>/);
    if (lpMatch) {
      landingPageContent = lpMatch[1].trim();
      displayContent = displayContent.replace(lpMatch[0], "");
    }

    return { displayContent, prdContent, landingPageContent };
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) return;

      let accumulatedResponse = "";
      
      // Add placeholder for model response
      setMessages((prev) => [...prev, { role: "model", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        accumulatedResponse += text;

        // Update the last message with accumulated content
        setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            lastMsg.content = accumulatedResponse;
            return newMessages;
        });
      }

      // Final processing for files
      const { displayContent, prdContent, landingPageContent } = extractFiles(accumulatedResponse);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        lastMsg.content = displayContent; // Remove tags from display
        lastMsg.prdContent = prdContent;
        lastMsg.landingPageContent = landingPageContent;
        return newMessages;
      });

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine current view state
  const lastModelMessage = messages.slice().reverse().find(m => m.role === "model");
  const isResultView = lastModelMessage && (
    lastModelMessage.content.length > 400 || 
    lastModelMessage.content.includes("|") || 
    lastModelMessage.prdContent !== undefined
  );

  const questionNumber = messages.filter(m => m.role === "user").length + 1;

  return (
    <div className="w-full max-w-4xl min-h-[60vh] flex flex-col justify-center items-center relative perspective-1000">
      
      {/* Main Content Area */}
      <div className="w-full transition-all duration-500 ease-in-out">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
             <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
             </div>
             <p className="text-xl text-muted-foreground font-light animate-pulse">Thinking...</p>
          </div>
        ) : isResultView ? (
          /* Result / Complex View */
          <Card className="w-full shadow-2xl border-muted animate-in slide-in-from-bottom-10 fade-in duration-700">
            <CardContent className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
               <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {lastModelMessage?.content || ""}
                  </ReactMarkdown>
               </div>

               {/* File Download Buttons */}
               {(lastModelMessage?.prdContent || lastModelMessage?.landingPageContent) && (
                  <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t">
                    {lastModelMessage.prdContent && (
                      <Button 
                        size="lg" 
                        className="gap-2 shadow-lg hover:shadow-xl transition-all"
                        onClick={() => downloadFile("PRD.md", lastModelMessage.prdContent!)}
                      >
                        <FileText className="w-5 h-5" />
                        Download PRD
                      </Button>
                    )}
                    {lastModelMessage.landingPageContent && (
                      <Button 
                        size="lg" 
                        className="gap-2 shadow-lg hover:shadow-xl transition-all"
                        onClick={() => downloadFile("LandingPage.md", lastModelMessage.landingPageContent!)}
                      >
                        <FileText className="w-5 h-5" />
                        Download Landing Page
                      </Button>
                    )}
                  </div>
                )}
                <div ref={scrollRef} />
            </CardContent>
            {/* In result view, we might want a different input or just continue conversation */}
             <div className="p-4 border-t bg-muted/10">
                <div className="flex gap-2">
                    <Input
                        placeholder="Reply to refine..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
             </div>
          </Card>
        ) : (
          /* Typeform-style Question View */
          <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-8 fade-in duration-500">
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary/80 font-medium uppercase tracking-wider text-sm mb-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full border border-primary/30 text-xs">
                        {questionNumber}
                    </span>
                    QUESTION
                </div>
                <h2 className="text-3xl md:text-4xl font-medium leading-tight tracking-tight text-foreground">
                    {lastModelMessage?.content}
                </h2>
             </div>

             <div className="relative group">
                <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer here..."
                    className="w-full text-2xl md:text-3xl border-0 border-b-2 border-muted-foreground/20 rounded-none px-0 py-4 h-auto focus-visible:ring-0 focus-visible:border-primary bg-transparent placeholder:text-muted-foreground/30 transition-colors"
                    autoFocus
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                    <Button 
                        onClick={handleSend}
                        disabled={!input.trim()}
                        size="lg"
                        className={cn(
                            "rounded-full px-6 transition-all duration-300",
                            input.trim() ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0 pointer-events-none"
                        )}
                    >
                        OK <CheckCircle2 className="w-4 h-4 ml-2" />
                    </Button>
                </div>
                <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1 opacity-60">
                    <span>Press</span> 
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">↵</span> Enter
                    </kbd>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
