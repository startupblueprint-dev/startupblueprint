"use client";

import { useEffect, useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { TopBar } from "@/components/top-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ChartPie,
  CircleHelp,
  DollarSign,
  Layers,
  Lightbulb,
  ListChecks,
  Rocket,
  Route,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  tag_type: string;
}

interface Solution {
  id: string;
  position: number;
  title: string;
  summary: string | null;
  is_selected: boolean;
  pain: string | null;
  solution_description: string | null;
  ideal_customer_profile: string | null;
  business_model_pricing: string | null;
  tam_sam_som: string | null;
  go_to_market_plan: string | null;
  current_solutions: string | null;
  ten_x_opportunity: string | null;
  features_mvp: string[] | null;
  features_roadmap: string[] | null;
}

interface Session {
  id: string;
  intro_summary: string;
  created_at: string;
  tags: Tag[];
  solutions: Solution[];
}

const SOLUTION_SECTION_TOOLTIPS: Record<string, string> = {
  "Pain Point":
    "Clarifies the urgent workflow breakdown or frustration your target customer lives with today.",
  Solution:
    "Explains the product concept that relieves the pain in a defensible, scalable way.",
  "Ideal Customer Profile":
    "Defines the buyer persona or team that feels the pain most intensely and buys fastest.",
  "Business Model & Pricing":
    "Describes how revenue is captured—pricing model, tiers, or monetization levers.",
  "TAM/SAM/SOM":
    "TAM: Total demand for the market.\nSAM: Portion you can target.\nSOM: Portion you can realistically win.",
  "Go-to-Market Plan":
    "Outlines the channels, programs, and motions to reach and convert the Ideal Customer Profile (ICP).",
  "Current Solutions": "Summarizes incumbent tools or hacks customers rely on right now.",
  "10x Better Opportunity":
    "Quantifies why this approach is dramatically better than existing options.",
  Features:
    "Separates MVP launch-critical functionality from Roadmap experiments that extend the vision.",
};

function SessionDetailModal({
  session,
  solution,
  onClose,
}: {
  session: Session;
  solution: Solution | null;
  onClose: () => void;
}) {
  const solutionSections = solution
    ? (
        [
          {
            title: "Pain Point",
            content: solution.pain,
            icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
            tooltip: SOLUTION_SECTION_TOOLTIPS["Pain Point"],
          },
          {
            title: "Solution",
            content: solution.solution_description,
            icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
            tooltip: SOLUTION_SECTION_TOOLTIPS.Solution,
          },
          {
            title: "Ideal Customer Profile",
            content: solution.ideal_customer_profile,
            icon: <Users className="h-5 w-5 text-blue-500" />,
            tooltip: SOLUTION_SECTION_TOOLTIPS["Ideal Customer Profile"],
          },
          {
            title: "Business Model & Pricing",
            content: solution.business_model_pricing,
            icon: <DollarSign className="h-5 w-5 text-green-500" />,
            tooltip: SOLUTION_SECTION_TOOLTIPS["Business Model & Pricing"],
          },
          {
            title: "TAM/SAM/SOM",
            content: solution.tam_sam_som,
            icon: <ChartPie className="h-5 w-5 text-purple-500" />,
            tooltip: SOLUTION_SECTION_TOOLTIPS["TAM/SAM/SOM"],
          },
          {
            title: "Go-to-Market Plan",
            content: solution.go_to_market_plan,
            icon: <Route className="h-5 w-5 text-orange-500" />,
            tooltip: SOLUTION_SECTION_TOOLTIPS["Go-to-Market Plan"],
          },
          {
            title: "Current Solutions",
            content: solution.current_solutions,
            icon: <Layers className="h-5 w-5 text-slate-500" />,
            tooltip: SOLUTION_SECTION_TOOLTIPS["Current Solutions"],
          },
          {
            title: "10x Better Opportunity",
            content: solution.ten_x_opportunity,
            icon: <Rocket className="h-5 w-5 text-yellow-500" />,
            tooltip: SOLUTION_SECTION_TOOLTIPS["10x Better Opportunity"],
          },
          {
            title: "Features",
            content:
              solution.features_mvp?.length || solution.features_roadmap?.length
                ? undefined
                : null,
            icon: <ListChecks className="h-5 w-5 text-slate-400" />,
            tooltip: SOLUTION_SECTION_TOOLTIPS.Features,
          },
        ] as const
      ).filter((section) => {
        if (section.title === "Features") {
          return Boolean(solution.features_mvp?.length || solution.features_roadmap?.length);
        }
        return Boolean(section.content);
      })
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/60 bg-white p-6 shadow-2xl md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full hover:bg-slate-100"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="mb-6 space-y-4">
          <div className="px-3 sm:px-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">
              Summary
            </p>
            <h2 className="mt-2 text-slate-600 text-slate-900">
              {session.intro_summary}
            </h2>
          </div>

          {solution && (
            <div className="px-3 sm:px-4">
              <p className="text-xs font-semibold pt-4 uppercase tracking-[0.35em] text-sky-600">
                Solution
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                {solution.title}
              </h3>
              {solution.summary && (
                <p className="mt-2 text-slate-600">{solution.summary}</p>
              )}
            </div>
          )}
        </div>

        {solution ? (
          <div className="grid gap-5">
            {solutionSections.map((section) =>
              section.title === "Features" ? (
                <div key={section.title} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    {section.icon}
                    <div className="flex items-center gap-1 text-slate-900">
                      <h4 className="font-semibold">Features</h4>
                      <InfoTooltip text={section.tooltip} />
                    </div>
                  </div>
                  {solution.features_mvp && solution.features_mvp.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-2 text-sm font-medium text-slate-700">MVP Features</p>
                      <ul className="space-y-1">
                        {solution.features_mvp.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {solution.features_roadmap && solution.features_roadmap.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700">Roadmap Features</p>
                      <ul className="space-y-1">
                        {solution.features_roadmap.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <SolutionSection
                  key={section.title}
                  icon={section.icon}
                  title={section.title}
                  content={section.content as string}
                  tooltip={section.tooltip}
                />
              ),
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No solution details available for this session yet.
          </div>
        )}
      </div>
    </div>
  );
}

function SolutionSection({
  icon,
  title,
  content,
  tooltip,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  tooltip?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <div className="flex items-center gap-1 text-slate-900">
          <h4 className="font-semibold">{title}</h4>
          <InfoTooltip text={tooltip} />
        </div>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{content}</p>
    </div>
  );
}

function InfoTooltip({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="More info"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <CircleHelp className="h-4 w-4" />
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-600 text-left whitespace-pre-line opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

function SessionCard({
  session,
  onSelectSession,
}: {
  session: Session;
  onSelectSession: (session: Session, solution: Solution | null) => void;
}) {
  const problemTags = session.tags.filter((t) => t.tag_type === "problem");
  const selectedSolution =
    session.solutions.find((solution) => solution.is_selected) ||
    session.solutions[0];
  const primaryNarrative = selectedSolution?.pain || session.intro_summary;
  const handleCardClick = () => {
    onSelectSession(session, selectedSolution ?? null);
  };
  const formattedDate = new Date(session.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <button
      type="button"
      onClick={handleCardClick}
      className="w-full text-left"
    >
      <Card className="group h-[200px] border-slate-200/80 bg-white/95 shadow-[0_8px_40px_-20px_rgba(64,112,255,0.2)] transition-all hover:shadow-[0_12px_50px_-15px_rgba(64,112,255,0.35)]">
        <CardHeader className="flex h-full flex-col gap-3 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {problemTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="border-sky-200 bg-sky-50 text-xs text-sky-700"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            <CardDescription className="ml-auto text-xs text-slate-500 text-right">
              {formattedDate}
            </CardDescription>
          </div>
          <CardTitle className="mt-2 ml-1 pt-2 pb-4 pr-20 text-base font-normal text-slate-900">
            {primaryNarrative}
          </CardTitle>
        </CardHeader>
      </Card>
    </button>
  );
}

export default function WallPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch("/api/wall");
        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }
        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#051937] via-[#0a2a5f] to-[#0b3f83] text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(96,159,255,0.25)_1px,_transparent_0)] bg-[length:20px_20px]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(24,94,165,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(24,94,165,0.25)_1px,transparent_1px)] bg-[length:120px_120px] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1f3c]/40 to-[#01102a]" />
      </div>

      <div className="absolute top-4 right-4 z-20 hidden md:block">
        <ThemeSwitcher />
      </div>
      <div className="fixed inset-x-0 bottom-4 z-10 flex justify-center md:hidden">
        <ThemeSwitcher />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-10 md:px-10">
        <div className="w-full px-6 md:px-0">
          <TopBar fullWidth={false} />
        </div>

        <div className="relative rounded-[32px] border border-white/70 bg-white px-6 py-6 shadow-[0_30px_120px_-60px_rgba(64,112,255,0.45)] md:px-10 md:py-8">
          <p className="text-xs font-semibold px-3 sm:px-10 uppercase tracking-[0.35em] text-sky-600">
            The Wall of Problems
          </p>
          <h1 className="mt-3 text-2xl font-semibold px-3 sm:px-10 text-slate-900 md:text-3xl">
            Explore Real Industry Pains
          </h1>
          <div className="mt-6 px-3 sm:px-10">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center">
                <p className="text-slate-500">No discovery sessions yet.</p>
                <p className="mt-2 text-sm text-slate-400">
                  Start a new discovery session to see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onSelectSession={(selectedSession, solution) => {
                      setSelectedSession(selectedSession);
                      setSelectedSolution(solution);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          solution={selectedSolution}
          onClose={() => {
            setSelectedSession(null);
            setSelectedSolution(null);
          }}
        />
      )}
    </main>
  );
}
