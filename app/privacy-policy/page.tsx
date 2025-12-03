import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { TopBar } from "@/components/top-bar";

const policySections = [
  {
    title: "What We Collect",
    items: [
      "Identity data such as your name, email, and company role when you sign up or join a workspace.",
      "Product interaction data including prompts, saved templates, and chat feedback so we can improve recommendation quality.",
      "Technical data such as IP address, device info, and diagnostics gathered through cookies and similar technologies.",
    ],
  },
  {
    title: "How We Use Your Data",
    items: [
      "Authenticate and secure access to Startup Blueprint services.",
      "Generate personalized research guides, PRDs, and landing page copy tailored to your inputs.",
      "Deliver transactional emails about account changes, billing reminders, and product updates.",
      "Perform analytics to understand aggregate usage patterns and prioritize roadmap investments.",
    ],
  },
  {
    title: "Sharing & Disclosure",
    items: [
      "Service providers that host infrastructure (Supabase, Google Cloud, Vercel) under strict data processing agreements.",
      "Payment processors when you upgrade to a paid workspace.",
      "Government agencies or regulators if required by applicable law.",
    ],
  },
  {
    title: "Your Choices",
    items: [
      "Manage cookie preferences through your browser or operating system settings.",
      "Export or delete your workspace data by emailing support@startupblueprint.dev from the owner account.",
      "Opt out of non-essential product emails via the unsubscribe link included in each message.",
    ],
  },
];

const EFFECTIVE_DATE = "3 Dec 2025";

export default function PrivacyPolicyPage() {
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
      <div className="fixed inset-x-0 bottom-4 z-20 flex justify-center md:hidden">
        <ThemeSwitcher />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 pb-12 pt-6 md:px-10">
        <TopBar fullWidth />
        <article className="rounded-[32px] border border-white/60 bg-white/95 px-6 py-8 text-slate-900 shadow-[0_30px_120px_-60px_rgba(64,112,255,0.55)] backdrop-blur-md md:px-12 md:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">PRIVACY POLICY</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">Startup Blueprint</h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">Effective date: {EFFECTIVE_DATE}</p>
          <p className="mt-5 text-base leading-relaxed text-slate-700">
            This policy explains what information we collect, why we collect it, and how you can exercise control. By using Startup Blueprint you agree to the practices described below.
          </p>

          <div className="mt-10 space-y-8">
            {policySections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-6 text-slate-600">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
            <h3 className="text-base font-semibold text-slate-900">Contact</h3>
            <p className="mt-2 text-sm text-slate-600">
              Email <a className="font-medium text-sky-600 underline underline-offset-4" href="mailto:support@startupblueprint.dev">support@startupblueprint.dev</a> for questions, complaints, or to exercise your rights.
              EU residents may also review our <Link className="font-medium text-sky-600 underline underline-offset-4" href="/gdpr">GDPR statement</Link> for additional details.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
