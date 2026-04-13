import { TOTAL_WEEKS } from "@/lib/constants";
import { getCurrentWeekNumber } from "@/lib/training-plan";
import { PlanClient } from "@/components/plan/PlanClient";

type Props = {
  searchParams: Promise<{ week?: string }>;
};

export default async function PlanPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.week;
  let fromUrl: number | undefined;
  if (raw !== undefined && raw !== "") {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n)) fromUrl = n;
  }
  if (fromUrl != null && (fromUrl < 1 || fromUrl > TOTAL_WEEKS)) {
    fromUrl = undefined;
  }
  /** Zonder ?week= altijd de actuele trainingsweek (nieuw bezoek / Plan in menu). */
  const initialWeek = fromUrl ?? getCurrentWeekNumber();

  return <PlanClient initialWeek={initialWeek} />;
}
