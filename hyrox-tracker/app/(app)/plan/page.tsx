import { PlanClient } from "@/components/plan/PlanClient";

type Props = {
  searchParams: Promise<{ week?: string }>;
};

export default async function PlanPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.week;
  let initialWeekFromUrl: number | undefined;
  if (raw !== undefined && raw !== "") {
    const n = Number.parseInt(raw, 10);
    initialWeekFromUrl = Number.isFinite(n) ? n : undefined;
  }

  return <PlanClient initialWeekFromUrl={initialWeekFromUrl} />;
}
