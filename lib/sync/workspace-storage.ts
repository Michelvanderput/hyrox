export const ACTIVE_TEAM_STORAGE_KEY = "hyrox-active-team-id";

export function readActiveTeamId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_TEAM_STORAGE_KEY);
}

export function writeActiveTeamId(teamId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_TEAM_STORAGE_KEY, teamId);
  window.dispatchEvent(new Event("hyrox-workspace-refresh"));
}
