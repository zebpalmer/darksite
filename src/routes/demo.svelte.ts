// Gallery-only state the layout reads, so the NavRail and TabBar pages can show badges live.
export const demo = $state<{ badges: Record<string, number | boolean | null> }>({ badges: {} });
