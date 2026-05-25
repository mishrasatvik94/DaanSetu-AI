import { Impact } from "../components/Impact";
import { PageHeader } from "./PageHeader";

export function ImpactPage() {
  return (
    <main>
      <PageHeader eyebrow="LIVE IMPACT" title="Every meal, accounted for." subtitle="Transparency is non-negotiable. See where every donation goes — in real time." />
      <Impact />
    </main>
  );
}
