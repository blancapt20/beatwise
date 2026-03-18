export function Footer() {
  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Roadmap", href: "#roadmap" },
    ],
    company: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#blog" },
      { label: "Contact", href: "#contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
    ],
  };

  return (
    <footer className="flex w-full flex-col gap-12 bg-[var(--color-bg-primary)] px-12 py-12">
      {/* Top Section */}
      <div className="flex w-full justify-between">
        {/* Brand */}
        <div className="flex w-[360px] flex-col gap-4">
          <div className="flex items-center gap-3">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2 6C2 4.34315 3.34315 3 5 3H19C20.6569 3 22 4.34315 22 6V18C22 19.6569 20.6569 21 19 21H5C3.34315 21 2 19.6569 2 18V6Z"
                stroke="var(--color-accent-orange)"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M2 9H22M8 3V21"
                stroke="var(--color-accent-orange)"
                strokeWidth="2"
              />
            </svg>
            <span className="font-display text-[20px] font-semibold text-[var(--color-text-primary)]">
              BeatWise
            </span>
          </div>
          <p className="font-mono text-[13px] leading-[1.5] text-[var(--color-text-secondary)]">
            Know your beats, prep your sets.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-20">
          <div className="flex w-[160px] flex-col gap-4">
            <h3 className="font-mono text-[12px] font-semibold text-[var(--color-text-primary)]">
              PRODUCT
            </h3>
            {footerLinks.product.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex w-[160px] flex-col gap-4">
            <h3 className="font-mono text-[12px] font-semibold text-[var(--color-text-primary)]">
              COMPANY
            </h3>
            {footerLinks.company.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex w-[160px] flex-col gap-4">
            <h3 className="font-mono text-[12px] font-semibold text-[var(--color-text-primary)]">
              LEGAL
            </h3>
            {footerLinks.legal.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex w-full items-center justify-between border-t border-[var(--color-bg-elevated)] pt-6">
        <p className="font-mono text-[13px] text-[var(--color-text-secondary)]">
          © 2026 BeatWise. All rights reserved.
        </p>
        
        <div className="flex gap-6">
          <a href="#" aria-label="Twitter" className="hover:opacity-70 transition-opacity">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="var(--color-text-secondary)">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
            </svg>
          </a>
          <a href="#" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a href="#" aria-label="GitHub" className="hover:opacity-70 transition-opacity">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="var(--color-text-secondary)">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
