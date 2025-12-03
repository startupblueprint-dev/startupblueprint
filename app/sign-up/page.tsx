import { SignUpForm } from "@/components/sign-up-form";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { TopBar } from "@/components/top-bar";

export default function Page() {
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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-10 pt-8 md:px-10">
        <TopBar fullWidth />
        <div className="mt-8 grid gap-10 rounded-[32px] border border-white/70 bg-white/95 p-6 text-slate-900 shadow-[0_30px_120px_-60px_rgba(64,112,255,0.45)] backdrop-blur md:grid-cols-[minmax(0,1fr)_380px] md:p-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">
                Start here
              </p>
              <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                Create an account and unlock guided momentum
              </h1>
              <p className="text-base text-slate-600">
                Get instant access to collaborative canvases, AI research buddies,
                and curated playbooks designed for your stage.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-slate-100/80 bg-slate-50/70 p-5 text-sm text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-900">What’s included</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Personalized action items synced across devices</li>
                <li>Anonymous sandboxing until you publish your plan</li>
                <li>Seamless hand-off between teammates and mentors</li>
              </ul>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <SignUpForm />
          </div>
        </div>
      </div>
    </main>
  );
}
