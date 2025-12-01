"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  FileText,
  CircleArrowRight,
  AlertTriangle,
  Lightbulb,
  Users,
  DollarSign,
  Route,
  Layers,
  Rocket,
  ListChecks,
  Check,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type LoadingPhase = "questions" | "suggestions" | "documents";

const LOADING_FRAMES: Record<LoadingPhase, string[]> = {
  questions: ["Thinking.", "Thinking..", "Thinking..."],
  suggestions: [
    "Solving Problems.",
    "Solving Problems..",
    "Solving Problems...",
    "Solving Problems.",
    "Solving Problems..",
    "Solving Problems...",
    "Solving Problems.",
    "Solving Problems..",
    "Solving Problems...",
    "Solving Problems.",
    "Solving Problems..",
    "Solving Problems...",
    "Generating Solutions.",
    "Generating Solutions..",
    "Generating Solutions...",
    "Generating Solutions.",
    "Generating Solutions..",
    "Generating Solutions...",
    "Generating Solutions.",
    "Generating Solutions..",
    "Generating Solutions...",
    "Generating Solutions.",
    "Generating Solutions..",
    "Generating Solutions...",            
  ],
  documents: [
    "Generating Landing Page.",
    "Generating Landing Page..",
    "Generating Landing Page...",
    "Developing PRD.",
    "Developing PRD..",
    "Developing PRD...",
    "Almost Done.",
    "Almost Done..",
    "Almost Done...",
  ],
};

type Message = {
  role: "user" | "model";
  content: string;
  prdContent?: string;
  landingPageContent?: string;
};

type ParsedSuggestion = {
  title: string;
  summary?: string;
  fields: Record<string, string | { Core?: string | string[]; Base?: string | string[] }>;
};

type ChatInterfaceProps = {
  onSuggestionsVisible?: (visible: boolean) => void;
};

export function ChatInterface({ onSuggestionsVisible }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "What industry or professional field do you have the most experience in?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingFrameIndex, setThinkingFrameIndex] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("questions");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    if (typeof window !== "undefined" && input) {
      localStorage.setItem("pendingInput", input);
    }
  }, [input]);

  const loadingFrames = LOADING_FRAMES[loadingPhase];

  useEffect(() => {
    if (!isLoading) {
      setThinkingFrameIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setThinkingFrameIndex((index) => (index + 1) % loadingFrames.length);
    }, 600);

    return () => window.clearInterval(interval);
  }, [isLoading, loadingFrames.length, loadingFrames]);

  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

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

    const prdMatch = text.match(/<PRD_FILE>([\s\S]*?)<\/PRD_FILE>/);
    if (prdMatch) {
      prdContent = prdMatch[1].trim();
      displayContent = displayContent.replace(prdMatch[0], "");
    }

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

  const handleBuildClick = (solutionNumber: number) => {
    setSelectedSolution(solutionNumber);
    setConfirmDialogOpen(true);
  };

  const handleConfirmBuild = async () => {
    if (selectedSolution !== null) {
      setConfirmDialogOpen(false);
      
      // Directly send the selection as a message
      const userMessage: Message = { role: "user", content: String(selectedSolution) };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setLoadingPhase("documents");

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
        setMessages((prev) => [...prev, { role: "model", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          accumulatedResponse += text;

          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            lastMsg.content = accumulatedResponse;
            return newMessages;
          });
        }

        const { displayContent, prdContent, landingPageContent } = extractFiles(accumulatedResponse);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          lastMsg.content = displayContent;
          lastMsg.prdContent = prdContent;
          lastMsg.landingPageContent = landingPageContent;
          return newMessages;
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const isSelectingSolution =
      /^\s*[123]\s*$/.test(trimmedInput) ||
      /solution\s*[123]/i.test(trimmedInput) ||
      /pick\s*(solution)?\s*[123]/i.test(trimmedInput) ||
      /choose\s*(solution)?\s*[123]/i.test(trimmedInput) ||
      /go\s*with\s*(solution)?\s*[123]/i.test(trimmedInput) ||
      /option\s*[123]/i.test(trimmedInput);

    if (hasSuggestions && isSelectingSolution) {
      setLoadingPhase("documents");
    } else if (!hasSuggestions && questionNumber > 8) {
      setLoadingPhase("suggestions");
    } else {
      setLoadingPhase("questions");
    }

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
      setMessages((prev) => [...prev, { role: "model", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        accumulatedResponse += text;

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          lastMsg.content = accumulatedResponse;
          return newMessages;
        });
      }

      const { displayContent, prdContent, landingPageContent } = extractFiles(accumulatedResponse);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        lastMsg.content = displayContent;
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

  const lastModelMessage = messages.slice().reverse().find((m) => m.role === "model");
  const questionNumber = messages.filter((m) => m.role === "user").length + 1;

  const { questionText } = useMemo(() => {
    const content = lastModelMessage?.content ?? "";
    const markerIndex = content.indexOf("**Question");
    if (markerIndex === -1) {
      return { prefaceText: content.trim(), questionText: "" };
    }
    const preface = content.slice(0, markerIndex).trim();
    const question = content.slice(markerIndex).replace(/\*\*/g, "").trim();
    return { prefaceText: preface, questionText: question };
  }, [lastModelMessage?.content]);

  const activeQuestionText = questionText || lastModelMessage?.content || "";

  const sanitizeJsonString = (input: string) =>
    input
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/,\s*([}\]])/g, "$1");

  const structuredPayload = useMemo(() => {
    if (!lastModelMessage?.content) return null;
    const raw = lastModelMessage.content.trim();

    let braceCount = 0;
    let firstBrace = -1;
    let lastBrace = -1;

    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === "{") {
        if (firstBrace === -1) firstBrace = i;
        braceCount++;
      } else if (raw[i] === "}") {
        braceCount--;
        if (braceCount === 0 && firstBrace !== -1) {
          lastBrace = i;
          break;
        }
      }
    }

    if (firstBrace === -1 || lastBrace === -1) return null;
    const jsonSlice = raw.slice(firstBrace, lastBrace + 1);

    const candidates = [jsonSlice, sanitizeJsonString(jsonSlice)];
    for (const candidate of candidates) {
      try {
        const parsed = JSON.parse(candidate);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          return parsed;
        }
      } catch {
        continue;
      }
    }

    return null;
  }, [lastModelMessage?.content]);

  // Field pairs for 2-column layout: [left, right]
  const suggestionFieldPairs: [string, string][] = [
    ["Pain", "Solution"],
    ["Ideal Customer Profile", "Go-to-Market Plan"],
    ["Current Solutions", "10x Better Opportunity"],
    ["Business Model/Pricing", "Feature List"],
  ];

  const suggestionFieldLabels = suggestionFieldPairs.flat();

  const suggestionFieldIcons: Record<string, LucideIcon> = {
    Pain: AlertTriangle,
    Solution: Lightbulb,
    "Ideal Customer Profile": Users,
    "Business Model/Pricing": DollarSign,
    "Go-to-Market Plan": Route,
    "Current Solutions": Layers,
    "10x Better Opportunity": Rocket,
    "Feature List": ListChecks,
  };

  const ACRONYMS = ["AI", "API", "ML", "UI", "UX", "SaaS", "CRM", "ERP", "B2B", "B2C", "IoT", "SDK", "KPI"];

  const formatFeatureItem = (text: string) =>
    text
      .split(/\s+/)
      .map((word) => {
        const upper = word.toUpperCase();
        if (ACRONYMS.includes(upper)) return upper;
        return word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : "";
      })
      .join(" ");

  const splitRawItems = (text?: string) =>
    text
      ? text
          .split(/\n|(?:,\s*(?=[A-Z]))|•/)
          .map((item) => item.trim())
          .filter(Boolean)
          .map(formatFeatureItem)
      : [];

  const normalizeFeatureItems = (input?: string | string[]) => {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input.map((item) => formatFeatureItem(item.trim())).filter(Boolean);
    }
    return splitRawItems(input);
  };

  const parseFeatureList = (
    value: string | { Core?: string | string[]; Base?: string | string[] }
  ) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return {
        core: normalizeFeatureItems(value.Core),
        base: normalizeFeatureItems(value.Base),
      };
    }

    const stringValue = typeof value === "string" ? value : "";
    const coreMatch = stringValue.match(/Core:?([\s\S]*?)(?=Base:|$)/i);
    const baseMatch = stringValue.match(/Base:?([\s\S]*)/i);
    const core = normalizeFeatureItems(coreMatch ? coreMatch[1] : undefined);
    const base = normalizeFeatureItems(baseMatch ? baseMatch[1] : undefined);
    if (!core.length && !base.length) {
      const fallback = normalizeFeatureItems(stringValue);
      return { core: fallback, base: [] };
    }
    return { core, base };
  };

  const suggestions = useMemo<ParsedSuggestion[]>(() => {
    if (structuredPayload?.suggestions?.length) {
      return structuredPayload.suggestions.map((item: any) => ({
        title: item.title ?? "",
        summary: item.summary ?? "",
        fields: item.fields ?? {},
      }));
    }

    if (!lastModelMessage?.content) return [];
    const content = lastModelMessage.content;
    const regex = /Suggestion\s+(\d+):\s*([^\n]+)\n([\s\S]*?)(?=Suggestion\s+\d+:|$)/gi;
    const lookup = suggestionFieldLabels.reduce<Record<string, string>>((acc, label) => {
      acc[label.toLowerCase()] = label;
      return acc;
    }, {});

    const parsed: ParsedSuggestion[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const title = match[2].trim();
      const block = match[3].trim();
      const lines = block.split(/\r?\n/);
      const fields: Record<string, string> = {};
      const summaryParts: string[] = [];
      let currentLabel: string | null = null;

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        const normalized = lookup[line.toLowerCase()];
        if (normalized) {
          currentLabel = normalized;
          fields[currentLabel] = "";
          continue;
        }
        if (currentLabel) {
          fields[currentLabel] = fields[currentLabel] ? `${fields[currentLabel]}\n${line}` : line;
        } else {
          summaryParts.push(line);
        }
      }

      parsed.push({
        title,
        summary: summaryParts.join(" ").trim(),
        fields,
      });
    }

    return parsed;
  }, [lastModelMessage?.content, suggestionFieldLabels]);

  const summaryContent = useMemo(() => {
    if (structuredPayload?.intro) return structuredPayload.intro;
    if (!lastModelMessage?.content) return "";
    if (!suggestions.length) return lastModelMessage.content;
    const intro = lastModelMessage.content.split(/Suggestion\s+1:/i)[0]?.trim();
    return intro || "";
  }, [structuredPayload, lastModelMessage?.content, suggestions.length]);

  const selectionPrompt = structuredPayload?.selectionPrompt ?? "";

  const hasSuggestions = suggestions.length > 0;
  const hasDocuments =
    lastModelMessage?.prdContent !== undefined || lastModelMessage?.landingPageContent !== undefined;

  // Notify parent when suggestions become visible
  useEffect(() => {
    onSuggestionsVisible?.(hasSuggestions);
  }, [hasSuggestions, onSuggestionsVisible]);

  const isResultView =
    lastModelMessage &&
    (hasSuggestions ||
      hasDocuments ||
      lastModelMessage.content.length > 400 ||
      lastModelMessage.content.includes("|"));

  const suggestionViewClasses = hasSuggestions
    ? "max-h-screen overflow-y-auto pr-2 sm:pr-4"
    : "";

  return (
    <div className={`flex w-full flex-col ${hasSuggestions ? "min-h-screen items-center justify-center px-4 sm:px-8 py-6" : "h-full sm:max-w-4xl"}`}>
      <div className={`relative w-full transition-all duration-500 ease-in-out ${hasSuggestions ? "max-w-4xl" : "flex-1"} ${suggestionViewClasses}`}>
        {isLoading ? (
          <div className="relative isolate flex h-full flex-col animate-in fade-in duration-500">
            <div className="flex flex-1 flex-col justify-center rounded-[40px] border border-white/70 bg-white/90 px-4 pb-6 pt-4 text-center shadow-[0_40px_140px_-90px_rgba(15,23,42,0.75)] backdrop-blur sm:p-10">
              <h2 className="text-sm font-semibold leading-tight text-sky-700 md:text-lg">
                <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent animate-[pulse_2s_ease-in-out_infinite]">
                  {loadingFrames[thinkingFrameIndex % loadingFrames.length]}
                </span>
              </h2>
            </div>
          </div>
        ) : isResultView ? (
          <>
            {hasSuggestions ? (
              <>
                {summaryContent && (
                  <div className="relative flex w-full flex-col rounded-3xl border border-slate-100 bg-white px-6 sm:px-[10%] py-6 pb-10 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.85)]">
                    <div className="space-y-3 pt-2 pr-0 sm:pr-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Pain / Solution Summary
                      </p>
                      <div className="prose prose-sm prose-slate max-w-none text-xs sm:text-sm text-slate-600">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{summaryContent}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.title + index}
                    className="relative mt-6 flex w-full flex-col rounded-3xl border border-slate-100 bg-white px-6 sm:px-[10%] py-6 pb-16 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.85)] first:mt-0"
                  >
                    <Button
                      onClick={() => handleBuildClick(index + 1)}
                      className="absolute right-4 top-4 gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-sky-600 hover:shadow-xl sm:right-6 sm:top-6"
                    >
                      <Sparkles className="h-4 w-4" />
                      Build This
                    </Button>
                    <div className="space-y-1 pt-6 pb-2 pr-28 sm:pr-32">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Solution {index + 1}
                      </p>
                      <h3 className="text-xl font-bold text-slate-900">{suggestion.title}</h3>
                      {suggestion.summary && (
                        <p className="text-xs sm:text-sm text-slate-600">{suggestion.summary}</p>
                      )}
                    </div>
                    <div className="mt-5 space-y-8 text-xs sm:text-sm text-slate-600">
                      {suggestionFieldPairs.map(([leftLabel, rightLabel]) => {
                        const leftValue = suggestion.fields[leftLabel];
                        const rightValue = suggestion.fields[rightLabel];
                        const LeftIcon = suggestionFieldIcons[leftLabel];
                        const RightIcon = suggestionFieldIcons[rightLabel];

                        const renderSimpleField = (
                          label: string,
                          value: any,
                          Icon: LucideIcon | undefined
                        ) => {
                          if (!value) return null;
                          return (
                            <div>
                              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                                {Icon && <Icon className="h-4 w-4 text-sky-500" />}
                                {label}
                              </p>
                              <p className="mt-1 whitespace-pre-line text-slate-600">{value as string}</p>
                            </div>
                          );
                        };

                        const renderFeatureListBlock = (value: any) => {
                          if (!value) return null;
                          const { core, base } = parseFeatureList(
                            value as string | { Core?: string | string[]; Base?: string | string[] }
                          );
                          return (
                            <div className="space-y-3">
                              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                                {RightIcon && <RightIcon className="h-4 w-4 text-sky-500" />}
                                Feature List
                              </p>
                              <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
                                <div>
                                  <p className="text-xs font-semibold uppercase text-slate-400">Core</p>
                                  <ul className="mt-2 space-y-2 text-slate-700">
                                    {core.length > 0 ? (
                                      core.map((item: string) => (
                                        <li key={item} className="flex items-start gap-2 text-sm">
                                          <Check className="mt-0.5 h-4 w-4 text-sky-500" />
                                          <span>{item}</span>
                                        </li>
                                      ))
                                    ) : (
                                      <li className="text-slate-500">No core features listed.</li>
                                    )}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold uppercase text-slate-400">Base</p>
                                  <ul className="mt-2 space-y-2 text-slate-700">
                                    {base.length > 0 ? (
                                      base.map((item: string) => (
                                        <li key={item} className="flex items-start gap-2 text-sm">
                                          <Check className="mt-0.5 h-4 w-4 text-sky-500" />
                                          <span>{item}</span>
                                        </li>
                                      ))
                                    ) : (
                                      <li className="text-slate-500">No base features listed.</li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          );
                        };

                        return (
                          <div key={`${leftLabel}-${rightLabel}`} className="space-y-6">
                            <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">
                              {renderSimpleField(leftLabel, leftValue, LeftIcon)}
                              {rightLabel === "Feature List"
                                ? <div />
                                : renderSimpleField(rightLabel, rightValue, RightIcon)}
                            </div>
                            {rightLabel === "Feature List" && renderFeatureListBlock(rightValue)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="rounded-[36px] border border-white/60 bg-white/95 p-6 sm:p-10 shadow-[0_40px_140px_-80px_rgba(15,23,42,0.65)] backdrop-blur space-y-8 max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto pr-2 sm:pr-4">
                <div className="prose prose-slate max-w-none text-slate-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {lastModelMessage?.content || ""}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {(lastModelMessage?.prdContent || lastModelMessage?.landingPageContent) && (
              <div className="mt-8 flex flex-wrap gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-6">
                {lastModelMessage.prdContent && (
                  <Button
                    size="lg"
                    className="group gap-2 rounded-2xl bg-white text-slate-900 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.65)] transition-colors hover:bg-sky-500 hover:text-white"
                    onClick={() => downloadFile("PRD.md", lastModelMessage.prdContent!)}
                  >
                    <FileText className="w-5 h-5 text-sky-500 transition-colors group-hover:text-white" />
                    Download PRD
                  </Button>
                )}
                {lastModelMessage.landingPageContent && (
                  <Button
                    size="lg"
                    className="group gap-2 rounded-2xl bg-white text-slate-900 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.65)] transition-colors hover:bg-sky-500 hover:text-white"
                    onClick={() => downloadFile("LandingPage.md", lastModelMessage.landingPageContent!)}
                  >
                    <FileText className="w-5 h-5 text-sky-500 transition-colors group-hover:text-white" />
                    Download Landing Page
                  </Button>
                )}
              </div>
            )}

            {!hasSuggestions && (
              <>
                <div className="mt-8 flex items-stretch gap-0">
                  <div className="flex-1 rounded-l-[28px] bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 p-[2px] sm:rounded-l-[999px]">
                    <div className="flex h-full items-center rounded-l-[26px] bg-white/90 pl-5 pr-0 sm:rounded-l-[998px] sm:pl-4">
                      <Input
                        placeholder="Reply to refine the plan…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="h-auto flex-1 border-none bg-transparent px-0 text-base text-slate-900 placeholder:text-slate-400 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    data-send-button
                    className="-ml-[3px] rounded-none rounded-r-[24px] bg-sky-500 px-5 text-white sm:-ml-[3px] sm:rounded-r-[500px] z-10 disabled:bg-slate-400 disabled:text-white disabled:opacity-100"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <div ref={scrollRef} />
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all"
                        style={{ width: `${Math.min((questionNumber / 8) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="whitespace-nowrap">{questionNumber}/8</span>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="relative isolate flex h-full flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="rounded-[40px] border border-white/70 bg-white/90 px-4 pb-6 pt-4 shadow-[0_40px_140px_-90px_rgba(15,23,42,0.75)] backdrop-blur sm:p-10">
              <div className="text-center">
                <h2 className="text-sm font-semibold leading-tight text-sky-700 md:text-lg">
                  {activeQuestionText}
                </h2>
              </div>
              <div className="mt-4 flex items-stretch gap-0 sm:mt-8">
                <div className="flex-1 rounded-l-[28px] bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 p-[2px] sm:rounded-l-[999px]">
                  <div className="flex h-full w-full flex-wrap items-center rounded-l-[26px] bg-white/95 pl-3 pr-0 sm:flex-nowrap sm:rounded-l-[998px] sm:pl-4">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your answer here…"
                      className="block h-auto max-h-32 w-full flex-1 resize-none border-none bg-transparent px-0 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:hidden"
                    />
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your answer here…"
                      className="hidden h-auto w-full flex-1 border-none bg-transparent px-0 text-base text-slate-900 placeholder:text-slate-400 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:block sm:text-lg"
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="-ml-[6px] rounded-none rounded-r-[24px] bg-slate-900 px-6 text-white transition-all shrink-0 sm:-ml-[6px] sm:rounded-r-[500px] z-10 disabled:bg-slate-400 disabled:text-white disabled:opacity-100"
                >
                  Next <CircleArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all"
                      style={{ width: `${Math.min((questionNumber / 8) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap">{questionNumber}/8</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
                <Sparkles className="h-7 w-7 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Build Solution {selectedSolution}?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                This will generate a detailed PRD and Landing Page for your selected solution.
              </p>
            </div>
            <div className="mt-8 flex gap-3">
              <Button
                onClick={() => setConfirmDialogOpen(false)}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBuild}
                className="flex-1 gap-2 rounded-xl bg-sky-500 py-3 text-white hover:bg-sky-600"
              >
                <Sparkles className="h-4 w-4" />
                Let's Build
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
