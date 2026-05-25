import { NGODetail } from "@/app/views/NGODetail";

export default function Page({ params }: { params: { id: string } }) {
  return <NGODetail id={params.id} />;
}
