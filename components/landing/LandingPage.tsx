import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { PlatformOverview } from "./PlatformOverview";
import { RoleFeatures } from "./RoleFeatures";
import { HowItWorks } from "./HowItWorks";
import { CTASection } from "./CTASection";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-white">
      <LandingNav />
      <main>
        <HeroSection />
        <PlatformOverview />
        <RoleFeatures />
        <HowItWorks />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
