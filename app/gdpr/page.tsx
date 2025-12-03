import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { TopBar } from "@/components/top-bar";

const sections = [
  {
    title: "Purpose & Legal Basis",
    body: "We collect founder profile data, project prompts, and chat transcripts in order to generate custom discovery questions, PRDs, and go-to-market assets. Processing is based on legitimate interest (Article 6(1)(f) GDPR) and, where applicable, your explicit consent (Article 6(1)(a)).",
  },
  {
    title: "Data Minimization",
    body: "Only the information required to tailor guidance is requested. Optional fields are clearly marked, and you can redact sensitive inputs at any time without degrading core functionality.",
  },
  {
    title: "Sub-processors",
    body: "Startup Blueprint relies on Supabase (EU-West) for authentication and persistence, and Google Cloud for transient AI inference. Data is encrypted in transit and at rest using TLS 1.2+ and AES-256.",
  },
  {
    title: "International Transfers",
    body: "When data moves outside the EEA, we enforce the latest Standard Contractual Clauses and conduct Transfer Impact Assessments to ensure adequate protection.",
  },
  {
    title: "Data Subject Rights",
    body: "You can request access, correction, deletion, restriction, or portability by emailing privacy@startupblueprint.ai. We respond within 30 days and never charge for the first copy of your data.",
  },
  {
    title: "Retention",
    body: "Operational data is retained for 12 months after the last login, then pseudonymized or deleted unless a longer period is required by law or you ask us to keep supporting your workspace.",
  },
  {
    title: "Incident Response",
    body: "We monitor for intrusion attempts 24/7. If a breach occurs, affected users and authorities are notified within 72 hours, including recommended remediation steps.",
  },
];

export default function GDPRPage() {
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
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">GDPR</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-2xl">General Data Protection Regulation (GDPR) Notice</h1>
          <p className="mt-3 text-sm text-slate-600 md:text-base">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          <p className="mt-5 text-base leading-relaxed text-slate-700">
            Startup Blueprint is committed to transparent, privacy-first product development. This notice outlines how we comply with the European Union&apos;s GDPR when processing your data as you explore customer discovery ideas through our platform.
          </p>

          <div className="mt-8 grid gap-6">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-[0_20px_70px_-65px_rgba(15,23,42,1)]">
                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
            <h3 className="text-base font-semibold text-slate-900">Need something else?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Email <a className="font-medium text-sky-600 underline underline-offset-4" href="mailto:support@startupblueprint.dev">support@startupblueprint.dev</a>
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
