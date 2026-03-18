import { Header } from "@/components/layout";
import {
  Hero,
  ProblemSection,
  SolutionSection,
  FeaturesSection,
  SocialProofSection,
  CTASection,
  Footer,
} from "@/features/landing";

export default function Home() {
  return (
    <div className="flex min-h-full w-full flex-col bg-[var(--color-bg-primary)]">
      <Header />
      <main className="flex w-full flex-col">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <SocialProofSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
