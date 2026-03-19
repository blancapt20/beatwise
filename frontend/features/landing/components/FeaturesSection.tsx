import Image from "next/image";

export function FeaturesSection() {
  const features = [
    {
      title: "QUALITY VALIDATION",
      description: "Automatic quality checks using Fakin' the Funk technology. Detect fake bitrates, clipping, and audio artifacts before they ruin your set.",
      items: [
        "Real vs. declared bitrate analysis",
        "Clipping and distortion detection",
        "RMS level verification",
      ],
      image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=1080",
      imageAlt: "Audio waveform visualization",
    },
    {
      title: "AI-POWERED TAGGING",
      description: "Let AI do the heavy lifting. Extract and complete metadata: artist, title, genre, BPM, key, intensity, mood—automatically.",
      items: [
        "Genre, BPM, and key detection",
        "Mood and intensity classification",
        "Smart metadata completion",
      ],
      image: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=1080",
      imageAlt: "Music metadata interface",
      reverse: true,
    },
    {
      title: "AUDIO NORMALIZATION",
      description: "Consistent volume across your entire library. No more reaching for the gain knob mid-set.",
      items: [
        "Target RMS normalization",
        "Intelligent volume adjustment",
      ],
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1080",
      imageAlt: "Audio mixing console",
    },
  ];

  return (
    <section className="flex w-full flex-col gap-12 bg-[var(--color-bg-secondary)] px-12 py-20">
      <h2 className="text-center font-display text-[36px] font-bold text-[var(--color-text-primary)]">
        CORE FEATURES
      </h2>

      <div className="flex flex-col gap-12">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`flex w-full items-center gap-12 ${feature.reverse ? "flex-row-reverse" : ""}`}
          >
            {/* Image */}
            <div className="relative h-[400px] w-[600px] flex-shrink-0 overflow-hidden rounded-[16px] bg-[var(--color-bg-elevated)]">
              <Image
                src={feature.image}
                alt={feature.imageAlt}
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex w-[500px] flex-col gap-4">
              <h3 className="font-display text-[28px] font-bold text-[var(--color-text-primary)]">
                {feature.title}
              </h3>
              <p className="font-mono text-[14px] leading-[1.5] text-[var(--color-text-secondary)]">
                {feature.description}
              </p>
              <div className="flex flex-col gap-3">
                {feature.items.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-[6px] w-[6px] flex-shrink-0 rounded-[3px] bg-[var(--color-accent-teal)]" />
                    <span className="font-mono text-[13px] text-[var(--color-text-primary)]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
