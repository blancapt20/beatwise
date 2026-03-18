"use client";

import { useState, useEffect } from "react";

export function Header() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <header className="flex w-full items-center justify-between bg-[var(--color-bg-secondary)] px-12 py-6">
      {/* Logo Area */}
      <div className="flex items-center gap-3">
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

      {/* Navigation */}
      <nav className="flex items-center gap-8">
        <a href="#features" className="font-mono text-[13px] text-[var(--color-text-primary)] hover:text-[var(--color-accent-orange)] transition-colors">
          Features
        </a>
        <a href="#how-it-works" className="font-mono text-[13px] text-[var(--color-text-primary)] hover:text-[var(--color-accent-orange)] transition-colors">
          How It Works
        </a>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-[16px] border-2 border-[var(--color-text-secondary)] hover:border-[var(--color-accent-orange)] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button className="flex h-10 items-center justify-center rounded-[16px] bg-[var(--color-accent-orange)] px-5 font-mono text-[12px] font-semibold text-[var(--color-text-on-accent)] hover:opacity-90 transition-opacity">
          Get Started
        </button>
      </nav>
    </header>
  );
}
