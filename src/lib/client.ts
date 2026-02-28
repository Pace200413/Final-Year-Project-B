// lib/client.ts
"use client";

import type { TimeFormat, DateFormat, TemperatureUnit } from "@/lib/utils";
export type { TimeFormat, DateFormat, TemperatureUnit } from "@/lib/utils";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
  createElement,
  type ReactNode,
} from "react";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/* ------------------------------------------------------------------ */
/* SettingsStore                                                       */
/* ------------------------------------------------------------------ */

export type TextSize = "small" | "default" | "large";

export interface SettingsState {
  textSize: TextSize;
  timeFormat: TimeFormat;
  dateFormat: DateFormat;
  temperatureUnit: TemperatureUnit;

  eventReminders: boolean;
  announcements: boolean;
  reminderLeadTime: number;

  cacheSize: number;
}

class SettingsStore {
  private listeners: Set<(state: SettingsState) => void> = new Set();
  private state: SettingsState = {
    textSize: "default",
    timeFormat: "12h",
    dateFormat: "short",
    temperatureUnit: "celsius",
    eventReminders: false,
    announcements: false,
    reminderLeadTime: 30,
    cacheSize: 0,
  };

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
      this.updateCacheSize();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("swin-app-settings");
      if (stored) this.state = { ...this.state, ...JSON.parse(stored) };
    } catch (e) {
      console.warn("Failed to load settings from storage:", e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem("swin-app-settings", JSON.stringify(this.state));
    } catch (e) {
      console.warn("Failed to save settings to storage:", e);
    }
  }

  private updateCacheSize() {
    try {
      if (!("caches" in window)) return;
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.open(k).then((c) => c.keys()))))
        .then((reqs) => {
          this.state.cacheSize = reqs.flat().length * 1000; // rough estimate
          this.notifyListeners();
        });
    } catch (e) {
      console.warn("Failed to calculate cache size:", e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.state));
  }

  updateSettings(updates: Partial<SettingsState>) {
    this.state = { ...this.state, ...updates };
    this.saveToStorage();
    this.notifyListeners();
  }

  getState(): SettingsState {
    return { ...this.state };
  }

  subscribe(listener: (state: SettingsState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset() {
    this.state = {
      textSize: "default",
      timeFormat: "12h",
      dateFormat: "short",
      temperatureUnit: "celsius",
      eventReminders: false,
      announcements: false,
      reminderLeadTime: 30,
      cacheSize: 0,
    };
    this.saveToStorage();
    this.notifyListeners();
  }
}

export const settingsStore = new SettingsStore();

/* ------------------------------------------------------------------ */
/* ThemeStore (custom)                                                 */
/* ------------------------------------------------------------------ */

export type Theme = "light" | "dark" | "system";

export interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
}

class ThemeStore {
  private listeners: Set<(state: ThemeState) => void> = new Set();
  private state: ThemeState = { theme: "system", resolvedTheme: "light" };

  private mediaQuery: MediaQueryList | null = null;
  private mediaHandler: (() => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
      this.updateResolvedTheme();
      this.syncSystemListener();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("swin-app-theme");
      if (stored === "light" || stored === "dark" || stored === "system") {
        this.state.theme = stored;
      }
    } catch (e) {
      console.warn("Failed to load theme from storage:", e);
    }
  }

  private saveToStorage(theme: Theme) {
    try {
      localStorage.setItem("swin-app-theme", theme);
    } catch (e) {
      console.warn("Failed to save theme to storage:", e);
    }
  }

  private applyTheme() {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(this.state.resolvedTheme);
  }

  private updateResolvedTheme() {
    if (this.state.theme === "system") {
      this.state.resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      this.state.resolvedTheme = this.state.theme;
    }
    this.applyTheme();
  }

  private syncSystemListener() {
    // detach old listener if any
    if (this.mediaQuery && this.mediaHandler) {
      this.mediaQuery.removeEventListener("change", this.mediaHandler);
    }

    if (this.state.theme !== "system") {
      this.mediaQuery = null;
      this.mediaHandler = null;
      return;
    }

    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.mediaHandler = () => {
      this.updateResolvedTheme();
      this.notifyListeners();
    };
    this.mediaQuery.addEventListener("change", this.mediaHandler);
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.state));
  }

  setTheme(theme: Theme) {
    this.state.theme = theme;
    this.saveToStorage(theme);
    this.updateResolvedTheme();
    this.syncSystemListener();
    this.notifyListeners();
  }

  getState(): ThemeState {
    return { ...this.state };
  }

  subscribe(listener: (state: ThemeState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const themeStore = new ThemeStore();

/* ------------------------------------------------------------------ */
/* NotificationManager                                                 */
/* ------------------------------------------------------------------ */

export interface NotificationSettings {
  eventReminders: boolean;
  announcements: boolean;
  reminderLeadTime: number;
}

class NotificationManager {
  private listeners: Set<(settings: NotificationSettings) => void> = new Set();
  private settings: NotificationSettings = {
    eventReminders: false,
    announcements: false,
    reminderLeadTime: 30,
  };

  constructor() {
    if (typeof window !== "undefined") this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("swin-app-notifications");
      if (stored) this.settings = { ...this.settings, ...JSON.parse(stored) };
    } catch (e) {
      console.warn("Failed to load notification settings:", e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem("swin-app-notifications", JSON.stringify(this.settings));
    } catch (e) {
      console.warn("Failed to save notification settings:", e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.settings));
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) throw new Error("Notifications not supported");
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    return await Notification.requestPermission();
  }

  isSupported(): boolean {
    return "Notification" in window && "serviceWorker" in navigator;
  }

  getPermission(): NotificationPermission {
    if (!("Notification" in window)) return "denied";
    return Notification.permission;
  }

  updateSettings(updates: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.saveToStorage();
    this.notifyListeners();
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  subscribe(listener: (settings: NotificationSettings) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async scheduleEventReminder(event: { id: string; title: string; date: string; venue: string }) {
    if (!this.settings.eventReminders || this.getPermission() !== "granted") return;

    const eventDate = new Date(event.date);
    const reminderTime = new Date(eventDate.getTime() - this.settings.reminderLeadTime * 60 * 1000);
    const now = new Date();
    if (reminderTime <= now) return;

    const timeout = reminderTime.getTime() - now.getTime();
    setTimeout(() => {
      if (this.getPermission() === "granted") {
        new Notification(`Event Reminder: ${event.title}`, {
          body: `Starting in ${this.settings.reminderLeadTime} minutes at ${event.venue}`,
          icon: "/favicon.ico",
          tag: `event-reminder-${event.id}`,
          requireInteraction: false,
        });
      }
    }, timeout);
  }

  async sendAnnouncement(title: string, body: string) {
    if (!this.settings.announcements || this.getPermission() !== "granted") return;

    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "announcement",
      requireInteraction: false,
    });
  }
}

export const notificationManager = new NotificationManager();

/* ------------------------------------------------------------------ */
/* clipboard                                                           */
/* ------------------------------------------------------------------ */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-999999px";
    textarea.style.top = "-999999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error("Copy failed:", err);
    return false;
  }
}

export function showToast(message: string, duration: number = 2000): void {
  const toast = document.createElement("div");
  toast.className =
    "fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 bg-slate-900 text-white text-sm rounded-full shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("animate-out", "fade-out", "slide-out-to-bottom-2");
    setTimeout(() => document.body.removeChild(toast), 200);
  }, duration);
}

/* ------------------------------------------------------------------ */
/* analytics                                                           */
/* ------------------------------------------------------------------ */

export function track(event: string, data: Record<string, unknown> = {}) {
  try {
    const body = JSON.stringify({ event, ts: Date.now(), ...data });
    if ("sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics", blob);
    } else {
      fetch("/api/analytics", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    /* no-op */
  }
}

/* ------------------------------------------------------------------ */
/* cookies                                                             */
/* ------------------------------------------------------------------ */

export function getCookie(name: string): string | null {
  const hit = document.cookie.split("; ").find((p) => p.startsWith(name + "="));
  return hit ? decodeURIComponent(hit.split("=").slice(1).join("=")) : null;
}

export function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/`;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/`;
}

/* ------------------------------------------------------------------ */
/* Bookmarks hook                                                      */
/* ------------------------------------------------------------------ */

let globalBookmarks = new Set<string>();
const globalListeners = new Set<() => void>();
let globalBookmarksLoaded = false;

function loadGlobalBookmarks() {
  if (!globalBookmarksLoaded && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("bookmarks");
      if (raw) globalBookmarks = new Set(JSON.parse(raw) as string[]);
      globalBookmarksLoaded = true;
    } catch {}
  }
}

function persistBookmarks() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("bookmarks", JSON.stringify([...globalBookmarks]));
    } catch {}
  }
}

function notifyBookmarkListeners() {
  globalListeners.forEach((l) => l());
}

export function useBookmarks() {
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [setStore, setSetStore] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGlobalBookmarks();
    setMounted(true);
    setSetStore(new Set(globalBookmarks));
    setReady(true);
  }, []);

  useEffect(() => {
    const listener = () => setSetStore(new Set(globalBookmarks));
    globalListeners.add(listener);
    return () => {
      globalListeners.delete(listener);
    };
  }, []);

  const isSaved = useCallback((id: string) => setStore.has(id), [setStore]);

  const toggle = useCallback((id: string) => {
    if (globalBookmarks.has(id)) globalBookmarks.delete(id);
    else globalBookmarks.add(id);

    persistBookmarks();
    notifyBookmarkListeners();
  }, []);

  const map = mounted ? setStore : new Set<string>();
  const ids = useMemo(() => (mounted ? [...setStore] : []), [setStore, mounted]);

  return { ready, mounted, isSaved, toggle, map, ids };
}

/* ------------------------------------------------------------------ */
/* Locale Provider                                                     */
/* ------------------------------------------------------------------ */

export interface LocaleSettings {
  timeFormat: TimeFormat;
  dateFormat: DateFormat;
  temperatureUnit: TemperatureUnit;
}

interface LocaleContextType {
  settings: LocaleSettings;
  updateSettings: (updates: Partial<LocaleSettings>) => void;
  isLoaded: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const defaultLocaleSettings: LocaleSettings = {
  timeFormat: "12h",
  dateFormat: "short",
  temperatureUnit: "celsius",
};

function getInitialLocaleSettings(): LocaleSettings {
  if (typeof window === "undefined") return defaultLocaleSettings;

  try {
    const stored = localStorage.getItem("swin-app-locale-settings");
    if (stored) return { ...defaultLocaleSettings, ...JSON.parse(stored) };
  } catch (error) {
    console.warn("Failed to load locale settings:", error);
  }
  return defaultLocaleSettings;
}

// Locale Provider
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LocaleSettings>(defaultLocaleSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSettings(getInitialLocaleSettings());
    setIsLoaded(true);
  }, []);

  const updateSettings = (updates: Partial<LocaleSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    try {
      localStorage.setItem("swin-app-locale-settings", JSON.stringify(newSettings));
    } catch (error) {
      console.warn("Failed to save locale settings:", error);
    }
  };

  return createElement(
    LocaleContext.Provider,
    { value: { settings, updateSettings, isLoaded } },
    children
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}

// Theme Provider (next-themes)
export function ThemeProvider({ children }: { children: ReactNode }) {
  return createElement(
    NextThemesProvider,
    {
      attribute: "class",
      defaultTheme: "light",
      enableSystem: true,
      disableTransitionOnChange: true,
      storageKey: "swin-app-theme",
    },
    children
  );
}