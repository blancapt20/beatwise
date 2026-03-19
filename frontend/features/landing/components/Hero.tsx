import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="flex w-full flex-col items-center gap-8 bg-[var(--color-bg-primary)] px-12 py-[120px]">
      {/* Badge */}
      <div className="rounded-[16px] bg-[var(--color-bg-elevated)] px-3 py-[6px]">
        <span className="font-mono text-[11px] font-semibold text-[var(--color-accent-teal)]">
          {"// AUTOMATION FOR DJS"}
        </span>
      </div>

      {/* Headline */}
      <h1 
        className="max-w-[900px] text-center font-display text-[64px] font-bold leading-[1.1] text-[var(--color-text-primary)]"
        style={{ whiteSpace: "pre-line" }}
      >
        KNOW YOUR BEATS,{"\n"}PREP YOUR SETS
      </h1>

      {/* Subheadline */}
      <p className="max-w-[700px] text-center font-mono text-[16px] leading-[1.5] text-[var(--color-text-secondary)]">
        Save hours preparing your music library. BeatWise validates, organizes, and tags your tracks using AI—from download to session start.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-4">
        <Link href="/upload">
          <button className="flex h-14 items-center justify-center rounded-[16px] bg-[var(--color-accent-orange)] px-8 font-mono text-[13px] font-semibold text-[var(--color-text-on-accent)] hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </Link>
        <button className="flex h-14 items-center justify-center rounded-[16px] border-2 border-[var(--color-text-secondary)] px-8 font-mono text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] transition-colors">
          Watch Demo
        </button>
      </div>

      {/* Hero Visual */}
      <div className="relative h-[500px] w-[1000px] overflow-hidden rounded-[16px] bg-[var(--color-bg-elevated)]">
        <Image
          src="https://images.unsplash.com/photo-1721589607926-f792eea1c39d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="DJ mixing music"
          fill
          className="object-cover"
        />
      </div>

      {/* Trust Signal */}
      <p className="font-mono text-[11px] text-[var(--color-text-secondary)]">
        {"// Trusted by DJs worldwide"}
      </p>
    </section>
  );
}
