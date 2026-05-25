import { Hero } from "../components/Hero";
import { LogoBar } from "../components/LogoBar";
import { HowItWorks } from "../components/HowItWorks";
import { Features } from "../components/Features";
import { Impact } from "../components/Impact";
import { DashboardPreview } from "../components/DashboardPreview";
import { Testimonials } from "../components/Testimonials";
import { FinalCTA } from "../components/FinalCTA";

export function Home() {
  return (
    <>
      <Hero />
      <LogoBar />
      <HowItWorks />
      <Features />
      <Impact />
      <DashboardPreview />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
