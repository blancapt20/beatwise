export function ProblemSection() {
  const problems = [
    {
      number: "[01]",
      title: "DOWNLOAD",
      description: "Track down files from Beatport, SoundCloud, Bandcamp, promos.",
    },
    {
      number: "[02]",
      title: "VALIDATE",
      description: "Check quality, bitrate, clipping, artifacts. Run Fakin' the Funk manually.",
    },
    {
      number: "[03]",
      title: "ORGANIZE",
      description: "Sort by genre, BPM, key. Build folder structures. Fix metadata.",
    },
  ];

  return (
    <section className="flex w-full flex-col items-center gap-12 bg-[var(--color-bg-secondary)] px-12 py-20">
      <h2 className="font-display text-[36px] font-bold text-[var(--color-text-primary)]">
        THE PROBLEM
      </h2>
      
      <p className="max-w-[800px] text-center font-mono text-[16px] leading-[1.5] text-[var(--color-text-secondary)]">
        Every DJ knows the pain: hours spent organizing files, validating quality, fixing tags, and preparing sets.{"\n"}
        Manual work that steals time from what matters—your music.
      </p>

      <div className="flex w-full justify-center gap-6">
        {problems.map((problem) => (
          <div
            key={problem.number}
            className="flex w-[360px] flex-col gap-4 rounded-[16px] bg-[var(--color-bg-elevated)] p-6"
          >
            <span className="font-display text-[20px] font-semibold text-[var(--color-accent-orange)]">
              {problem.number}
            </span>
            <h3 className="font-display text-[20px] font-semibold text-[var(--color-text-primary)]">
              {problem.title}
            </h3>
            <p className="font-mono text-[13px] leading-[1.5] text-[var(--color-text-secondary)]">
              {problem.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
