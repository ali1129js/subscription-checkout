export const THEME_NAMES = ["khaki", "graphite", "midnight"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export const MOTION_NAMES = ["static", "animated"] as const;
export type MotionName = (typeof MOTION_NAMES)[number];

export const LOCALE_NAMES = ["en", "de"] as const;
export type LocaleName = (typeof LOCALE_NAMES)[number];

export const DEFAULT_THEME: ThemeName = "graphite";
export const DEFAULT_MOTION: MotionName = "static";
export const DEFAULT_LOCALE: LocaleName = "en";
