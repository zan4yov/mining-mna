"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

/** Matches Tailwind default breakpoints (min-width). */
const BREAKPOINT_MIN_PX = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type ScreenBreakpoint = "xs" | keyof typeof BREAKPOINT_MIN_PX;

export type ScreenFormFactor = "phone" | "tablet" | "desktop";

export type ScreenOrientation = "portrait" | "landscape";

export type ScreenProfile = {
  width: number;
  height: number;
  breakpoint: ScreenBreakpoint;
  formFactor: ScreenFormFactor;
  orientation: ScreenOrientation;
  /** True when coarse pointer or no hover — typical phones / tablets. */
  isTouchPrimary: boolean;
  prefersReducedMotion: boolean;
};

const SERVER_PROFILE: ScreenProfile = {
  width: 1280,
  height: 800,
  breakpoint: "lg",
  formFactor: "desktop",
  orientation: "landscape",
  isTouchPrimary: false,
  prefersReducedMotion: false,
};

function breakpointForWidth(width: number): ScreenBreakpoint {
  if (width >= BREAKPOINT_MIN_PX["2xl"]) return "2xl";
  if (width >= BREAKPOINT_MIN_PX.xl) return "xl";
  if (width >= BREAKPOINT_MIN_PX.lg) return "lg";
  if (width >= BREAKPOINT_MIN_PX.md) return "md";
  if (width >= BREAKPOINT_MIN_PX.sm) return "sm";
  return "xs";
}

function formFactorForWidth(width: number): ScreenFormFactor {
  if (width < BREAKPOINT_MIN_PX.md) return "phone";
  if (width < BREAKPOINT_MIN_PX.lg) return "tablet";
  return "desktop";
}

/** Safari < 14 / legacy WebKit: `mql.addEventListener` is missing — use deprecated addListener. */
function subscribeMediaQuery(mq: MediaQueryList, onChange: () => void): () => void {
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }
  mq.addListener(onChange);
  return () => mq.removeListener(onChange);
}

function readProfile(): ScreenProfile {
  if (typeof window === "undefined") return SERVER_PROFILE;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const orientation: ScreenOrientation = width >= height ? "landscape" : "portrait";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const noHover = window.matchMedia("(hover: none)").matches;
  return {
    width,
    height,
    breakpoint: breakpointForWidth(width),
    formFactor: formFactorForWidth(width),
    orientation,
    isTouchPrimary: coarse || noHover,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const cleanups: (() => void)[] = [];

  if (typeof ResizeObserver !== "undefined" && document.documentElement) {
    try {
      const ro = new ResizeObserver(onChange);
      ro.observe(document.documentElement);
      cleanups.push(() => ro.disconnect());
    } catch {
      /* ignore */
    }
  }

  window.addEventListener("resize", onChange);
  window.addEventListener("orientationchange", onChange);
  cleanups.push(() => window.removeEventListener("resize", onChange));
  cleanups.push(() => window.removeEventListener("orientationchange", onChange));

  const mqs = [
    window.matchMedia("(pointer: coarse)"),
    window.matchMedia("(hover: none)"),
    window.matchMedia("(prefers-reduced-motion: reduce)"),
  ];
  for (const mq of mqs) {
    cleanups.push(subscribeMediaQuery(mq, onChange));
  }

  return () => {
    for (const u of cleanups) u();
  };
}

function getSnapshot(): ScreenProfile {
  if (typeof window === "undefined") return SERVER_PROFILE;
  return readProfile();
}

function getServerSnapshot(): ScreenProfile {
  return SERVER_PROFILE;
}

const ScreenProfileContext = createContext<ScreenProfile | null>(null);

function applyHtmlDataset(profile: ScreenProfile) {
  const el = document.documentElement;
  el.dataset.formFactor = profile.formFactor;
  el.dataset.orientation = profile.orientation;
  el.dataset.breakpoint = profile.breakpoint;
  el.dataset.touchPrimary = profile.isTouchPrimary ? "true" : "false";
  el.dataset.reducedMotion = profile.prefersReducedMotion ? "true" : "false";
}

export function ScreenProfileProvider({ children }: { children: React.ReactNode }) {
  const profile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useLayoutEffect(() => {
    applyHtmlDataset(profile);
  }, [profile]);

  const value = useMemo(() => profile, [profile]);

  return <ScreenProfileContext.Provider value={value}>{children}</ScreenProfileContext.Provider>;
}

export function useScreenProfile(): ScreenProfile {
  const ctx = useContext(ScreenProfileContext);
  if (!ctx) {
    throw new Error("useScreenProfile must be used within ScreenProfileProvider");
  }
  return ctx;
}

/**
 * Same data as `useScreenProfile` without requiring the provider (for rare leaf components).
 * Prefer `useScreenProfile` when the provider is present.
 */
export function useScreenProfileOptional(): ScreenProfile | null {
  return useContext(ScreenProfileContext);
}

export function useMediaQuery(query: string): boolean {
  const subscribeMq = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia(query);
      return subscribeMediaQuery(mq, onChange);
    },
    [query],
  );

  const getSnapshotMq = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);
  const getServerSnapshotMq = useCallback(() => false, []);

  return useSyncExternalStore(subscribeMq, getSnapshotMq, getServerSnapshotMq);
}
