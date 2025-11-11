let cachedVersion: string | null = null;
let versionPromise: Promise<string> | null = null;

export async function getDDragonVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;
  if (versionPromise) return versionPromise;

  versionPromise = fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json"
  )
    .then((res) => res.json())
    .then((versions) => {
      const v =
        Array.isArray(versions) && versions.length ? versions[0] : "13.12.1";
      cachedVersion = v;
      return v;
    })
    .catch(() => {
      cachedVersion = "13.12.1";
      return cachedVersion;
    });

  return versionPromise;
}

export async function getProfileIconUrl(
  iconId: number | null | undefined
): Promise<string> {
  const id = iconId ?? 1;
  const version = await getDDragonVersion();
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${id}.png`;
}

const roleMapping: Record<string, string> = {
  TOP: "top",
  JUNGLE: "jungle",
  MID: "middle",
  CARRY: "bottom",
  SUPPORT: "utility",
};

export function getRoleIconUrl(role: string): string {
  const mappedRole = roleMapping[role] || role.toLowerCase();
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${mappedRole}.svg`;
}

export const roleFallbackIcons: Record<string, string> = {
  TOP: "🗡️",
  JUNGLE: "🌿",
  MID: "⚡",
  CARRY: "🏹",
  SUPPORT: "🛡️",
};
