/** Cloud team: alleen eigen slot afvinken. Zonder team / zonder login: beide slots (lokaal duo). */
export function canEditAthleteSlot(
  viewerUserId: string | null,
  activeTeamId: string | null,
  memberUserIds: readonly [string | null, string | null],
  athleteIndex: 0 | 1,
): boolean {
  if (!viewerUserId || !activeTeamId) return true;
  const mid = memberUserIds[athleteIndex];
  if (!mid) return false;
  return mid === viewerUserId;
}

export function resolveMyAthleteIndex(
  memberUserIds: readonly [string | null, string | null],
  viewerUserId: string | null,
): 0 | 1 | null {
  if (!viewerUserId) return null;
  if (memberUserIds[0] === viewerUserId) return 0;
  if (memberUserIds[1] === viewerUserId) return 1;
  return null;
}
