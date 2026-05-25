"use client";

import { useParams } from "next/navigation";
import { CampaignLanding } from "@/app/views/CampaignLanding";

export default function Page() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";
  return <CampaignLanding slug={slug} />;
}
