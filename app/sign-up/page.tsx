import { SignUpForm } from "@/components/sign-up-form";
import { TopBar } from "@/components/top-bar";

export default function Page() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#051937] via-[#0a2a5f] to-[#0b3f83] text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(96,159,255,0.25)_1px,_transparent_0)] bg-[length:20px_20px]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(24,94,165,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(24,94,165,0.25)_1px,transparent_1px)] bg-[length:120px_120px] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1f3c]/40 to-[#01102a]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-10 pt-0 md:px-10">
        <TopBar />
        <div
          className="mt-4 rounded-[32px] border border-white/70 bg-white py-6 text-slate-900 shadow-[0_30px_120px_-60px_rgba(64,112,255,0.45)] md:py-8"
          style={{ paddingLeft: "120px", paddingRight: "120px" }}
        >
          <div className="flex w-full max-w-3xl flex-col gap-6 self-start" style={{ paddingLeft: "155px", paddingRight: "155px" }}>
            <div className="space-y-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black">
                Start here
              </p>
            </div>
            <SignUpForm className="w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
