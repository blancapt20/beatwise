export function CTASection() {
  return (
    <section className="flex w-full flex-col items-center gap-8 bg-[var(--color-bg-secondary)] px-12 py-[120px]">
      <h2 className="text-center font-display text-[48px] font-bold text-[var(--color-text-primary)]">
        READY TO SAVE HOURS?
      </h2>
      
      <p className="text-center font-mono text-[16px] text-[var(--color-text-secondary)]">
        Start processing your tracks now. Free and open source.
      </p>

      <button className="flex h-16 items-center justify-center rounded-[16px] bg-[var(--color-accent-orange)] px-12 font-mono text-[16px] font-semibold text-[var(--color-text-on-accent)] hover:opacity-90 transition-opacity">
        Get Started
      </button>

      <p className="font-mono text-[11px] text-[var(--color-text-secondary)]">
        {"// No installation required • Works directly in your browser"}
      </p>
    </section>
  );
}
