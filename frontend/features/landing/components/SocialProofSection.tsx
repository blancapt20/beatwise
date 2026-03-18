export function SocialProofSection() {
  const stats = [
    { value: "10K+", label: "Tracks Processed" },
    { value: "95%", label: "Time Saved" },
    { value: "100%", label: "Free to Start" },
  ];

  const testimonials = [
    {
      quote: "BeatWise cut my prep time from 4 hours to 20 minutes. Game changer.",
      author: "— DJ Alex Rivera",
    },
    {
      quote: "The quality validation alone is worth it. No more fake 320s in my sets.",
      author: "— Maya Chen, House DJ",
    },
    {
      quote: "Perfect for techno sets. The BPM and key tags are spot-on every time.",
      author: "— Marcus Schmidt",
    },
  ];

  return (
    <section className="flex w-full flex-col items-center gap-12 bg-[var(--color-bg-primary)] px-12 py-20">
      <h2 className="font-display text-[36px] font-bold text-[var(--color-text-primary)]">
        TRUSTED BY DJS
      </h2>

      {/* Stats */}
      <div className="flex w-full justify-center gap-12">
        {stats.map((stat) => (
          <div key={stat.label} className="flex w-[280px] flex-col items-center gap-2">
            <span className="font-display text-[48px] font-bold text-[var(--color-accent-orange)]">
              {stat.value}
            </span>
            <span className="font-mono text-[13px] text-[var(--color-text-secondary)]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="flex w-full justify-center gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="flex w-[360px] flex-col gap-5 rounded-[16px] bg-[var(--color-bg-elevated)] p-8"
          >
            <p className="font-mono text-[16px] leading-[1.5] text-[var(--color-text-primary)]">
              {testimonial.quote}
            </p>
            <span className="font-mono text-[13px] font-semibold text-[var(--color-accent-orange)]">
              {testimonial.author}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
