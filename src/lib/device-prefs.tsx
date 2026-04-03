"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Single localStorage JSON blob for device-level app behaviour. */
export const DEVICE_PREFS_STORAGE_KEY = "swin-device-prefs-v1";

const MOTION_LS_KEY = "a11y_motion";

export type HomeScrollSectionId =
  | "top"
  | "navigation"
  | "emergency"
  | "support-events"
  | "academics";

const ALL_SECTIONS: HomeScrollSectionId[] = [
  "top",
  "navigation",
  "emergency",
  "support-events",
  "academics",
];

export type ExternalLinkAction = "same-tab" | "new-tab";

export type DevicePrefs = {
  defaultHomeSection: HomeScrollSectionId;
  rememberLastHomeSection: boolean;
  lastHomeSection: HomeScrollSectionId | null;
  showOnboardingTips: boolean;
  showHomeQuickShortcuts: boolean;
  compactMode: boolean;
  reduceMotion: boolean;

  openExternalLinksInNewTab: boolean;
  confirmBeforeExternalSites: boolean;
  rememberExternalLinkPreference: boolean;
  rememberedExternalLinkAction: ExternalLinkAction | null;
};

export const DEFAULT_DEVICE_PREFS: DevicePrefs = {
  defaultHomeSection: "navigation",
  rememberLastHomeSection: false,
  lastHomeSection: null,
  showOnboardingTips: true,
  showHomeQuickShortcuts: true,
  compactMode: false,
  reduceMotion: false,

  openExternalLinksInNewTab: true,
  confirmBeforeExternalSites: false,
  rememberExternalLinkPreference: false,
  rememberedExternalLinkAction: null,
};

export const HOME_SECTION_OPTIONS: Array<{
  value: HomeScrollSectionId;
  label: string;
}> = [
  { value: "top", label: "Start of Home" },
  { value: "navigation", label: "Campus Navigation" },
  { value: "emergency", label: "Emergency & Safety" },
  { value: "support-events", label: "Support & Events" },
  { value: "academics", label: "Study & Library" },
];

/** Section anchors observed on `/` for “remember last section”. */
export const HOME_SCROLL_OBSERVE_IDS: HomeScrollSectionId[] = [
  "top",
  "navigation",
  "emergency",
  "support-events",
  "academics",
];

let cache: DevicePrefs = { ...DEFAULT_DEVICE_PREFS };
let initialized = false;
let storageAttached = false;
const listeners = new Set<() => void>();

const SERVER_DEVICE_PREFS_SNAPSHOT: DevicePrefs = DEFAULT_DEVICE_PREFS;

function normalizePrefs(p: Partial<DevicePrefs>): DevicePrefs {
  return {
    defaultHomeSection: ALL_SECTIONS.includes(
      p.defaultHomeSection as HomeScrollSectionId
    )
      ? (p.defaultHomeSection as HomeScrollSectionId)
      : DEFAULT_DEVICE_PREFS.defaultHomeSection,

    rememberLastHomeSection:
      typeof p.rememberLastHomeSection === "boolean"
        ? p.rememberLastHomeSection
        : DEFAULT_DEVICE_PREFS.rememberLastHomeSection,

    lastHomeSection:
      p.lastHomeSection && ALL_SECTIONS.includes(p.lastHomeSection)
        ? p.lastHomeSection
        : null,

    showOnboardingTips:
      typeof p.showOnboardingTips === "boolean"
        ? p.showOnboardingTips
        : DEFAULT_DEVICE_PREFS.showOnboardingTips,

    showHomeQuickShortcuts:
      typeof p.showHomeQuickShortcuts === "boolean"
        ? p.showHomeQuickShortcuts
        : DEFAULT_DEVICE_PREFS.showHomeQuickShortcuts,

    compactMode:
      typeof p.compactMode === "boolean"
        ? p.compactMode
        : DEFAULT_DEVICE_PREFS.compactMode,

    reduceMotion:
      typeof p.reduceMotion === "boolean"
        ? p.reduceMotion
        : DEFAULT_DEVICE_PREFS.reduceMotion,

    openExternalLinksInNewTab:
      typeof p.openExternalLinksInNewTab === "boolean"
        ? p.openExternalLinksInNewTab
        : DEFAULT_DEVICE_PREFS.openExternalLinksInNewTab,

    confirmBeforeExternalSites:
      typeof p.confirmBeforeExternalSites === "boolean"
        ? p.confirmBeforeExternalSites
        : DEFAULT_DEVICE_PREFS.confirmBeforeExternalSites,

    rememberExternalLinkPreference:
      typeof p.rememberExternalLinkPreference === "boolean"
        ? p.rememberExternalLinkPreference
        : DEFAULT_DEVICE_PREFS.rememberExternalLinkPreference,

    rememberedExternalLinkAction:
      p.rememberedExternalLinkAction === "same-tab" ||
      p.rememberedExternalLinkAction === "new-tab"
        ? p.rememberedExternalLinkAction
        : null,
  };
}

function loadFromStorage(): DevicePrefs {
  if (typeof window === "undefined") return { ...DEFAULT_DEVICE_PREFS };

  try {
    const raw = localStorage.getItem(DEVICE_PREFS_STORAGE_KEY);

    if (!raw) {
      let reduceMotion = DEFAULT_DEVICE_PREFS.reduceMotion;

      try {
        if (localStorage.getItem(MOTION_LS_KEY) === "reduced") {
          reduceMotion = true;
        }
      } catch {
        /* ignore */
      }

      return normalizePrefs({ ...DEFAULT_DEVICE_PREFS, reduceMotion });
    }

    return normalizePrefs(JSON.parse(raw) as Partial<DevicePrefs>);
  } catch {
    return { ...DEFAULT_DEVICE_PREFS };
  }
}

function persist(next: DevicePrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEVICE_PREFS_STORAGE_KEY, JSON.stringify(next));
}

function syncMotionToAppearance(reduceMotion: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOTION_LS_KEY, reduceMotion ? "reduced" : "standard");
  window.dispatchEvent(new Event("app-appearance-change"));
}

function emit() {
  listeners.forEach((fn) => fn());
}

function attachStorageListener() {
  if (typeof window === "undefined" || storageAttached) return;

  storageAttached = true;

  window.addEventListener("storage", (e) => {
    if (e.key !== DEVICE_PREFS_STORAGE_KEY && e.key !== null) return;
    cache = loadFromStorage();
    syncMotionToAppearance(cache.reduceMotion);
    emit();
  });
}

function initFromStorage() {
  if (typeof window === "undefined" || initialized) return;

  initialized = true;
  attachStorageListener();
  cache = loadFromStorage();
  syncMotionToAppearance(cache.reduceMotion);
}

export function getDevicePrefsSnapshot(): DevicePrefs {
  initFromStorage();
  return cache;
}

export function updateDevicePrefs(patch: Partial<DevicePrefs>) {
  initFromStorage();
  cache = normalizePrefs({ ...cache, ...patch });
  persist(cache);

  if ("reduceMotion" in patch) {
    syncMotionToAppearance(cache.reduceMotion);
  }

  emit();
}

export function resetDevicePrefsToDefaults() {
  initFromStorage();
  cache = { ...DEFAULT_DEVICE_PREFS };
  persist(cache);
  syncMotionToAppearance(false);
  emit();
}

function subscribe(listener: () => void) {
  initFromStorage();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDevicePrefs() {
  const prefs = useSyncExternalStore(
    subscribe,
    getDevicePrefsSnapshot,
    () => SERVER_DEVICE_PREFS_SNAPSHOT
  );

  const setPrefs = useCallback((patch: Partial<DevicePrefs>) => {
    updateDevicePrefs(patch);
  }, []);

  return { prefs, setPrefs, resetDevicePrefsToDefaults };
}

/** Target section when opening Home (before optional URL hash). */
export function resolveHomeScrollTarget(
  prefs: DevicePrefs
): HomeScrollSectionId {
  if (prefs.rememberLastHomeSection && prefs.lastHomeSection) {
    return prefs.lastHomeSection;
  }

  return prefs.defaultHomeSection;
}

export function homeNavHref(prefs: DevicePrefs): string {
  const id = resolveHomeScrollTarget(prefs);
  return id === "top" ? "/" : `/#${id}`;
}

export function getResolvedExternalLinkAction(
  prefs: DevicePrefs
): ExternalLinkAction {
  if (
    prefs.rememberExternalLinkPreference &&
    prefs.rememberedExternalLinkAction
  ) {
    return prefs.rememberedExternalLinkAction;
  }

  return prefs.openExternalLinksInNewTab ? "new-tab" : "same-tab";
}