"use client";

import { QRCampaignDetail } from "@/app/views/QRCampaignDetail";

export default function Page({ params }: { params: { slug: string } }) {
  return <QRCampaignDetail slug={params.slug} />;
}
