export function SolutionSection() {
  const steps = [
    {
      icon: "upload",
      title: "UPLOAD",
      description: "Drag & drop your tracks. MP3, WAV, FLAC supported.",
      color: "orange",
    },
    {
      icon: "zap",
      title: "PROCESS",
      description: "AI validates quality, normalizes audio, tags everything automatically.",
      color: "teal",
    },
    {
      icon: "download",
      title: "DOWNLOAD",
      description: "Get perfectly organized, tagged files ready for Rekordbox or VirtualDJ.",
      color: "orange",
    },
  ];

  return (
    <section className="flex w-full flex-col items-center gap-12 bg-[var(--color-bg-primary)] px-12 py-20">
      <h2 className="font-display text-[36px] font-bold text-[var(--color-text-primary)]">
        THE BEATWISE SOLUTION
      </h2>
      
      <p className="max-w-[800px] text-center font-mono text-[16px] leading-[1.5] text-[var(--color-text-secondary)]">
        Automate the entire workflow. Upload → Validate → Normalize → AI Tag → Download organized files.{"\n"}
        Done in minutes, not hours.
      </p>

      <div className="flex w-full justify-center gap-6">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex w-[280px] flex-col items-center gap-4 rounded-[16px] bg-[var(--color-bg-elevated)] p-6"
          >
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {step.icon === "upload" && (
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                  stroke={step.color === "orange" ? "var(--color-accent-orange)" : "var(--color-accent-teal)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {step.icon === "zap" && (
                <path
                  d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                  stroke={step.color === "orange" ? "var(--color-accent-orange)" : "var(--color-accent-teal)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {step.icon === "download" && (
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                  stroke={step.color === "orange" ? "var(--color-accent-orange)" : "var(--color-accent-teal)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            <h3 className="font-display text-[20px] font-semibold text-[var(--color-text-primary)]">
              {step.title}
            </h3>
            <p className="text-center font-mono text-[13px] leading-[1.5] text-[var(--color-text-secondary)]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
