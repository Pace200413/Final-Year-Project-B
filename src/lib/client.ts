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

/* ------------------------------------------------------------------ */
/* SettingsStore                                                       */
/* ------------------------------------------------------------------ */
function normalizeTextSize(value: unknown): TextSize {
  return value === "large" ? "large" : "default";
}
export type TextSize = "default" | "large";

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

const DEFAULT_SETTINGS_STATE: SettingsState = {
  textSize: "default",
  timeFormat: "12h",
  dateFormat: "short",
  temperatureUnit: "celsius",
  eventReminders: false,
  announcements: false,
  reminderLeadTime: 30,
  cacheSize: 0,
};

class SettingsStore {
  private listeners: Set<(state: SettingsState) => void> = new Set();
  private state: SettingsState = { ...DEFAULT_SETTINGS_STATE };

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
      this.updateCacheSize();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("swin-app-settings");
      if (!stored) return;

      const parsed = JSON.parse(stored) as Partial<SettingsState>;

      this.state = {
        ...this.state,
        ...parsed,
        textSize: normalizeTextSize(parsed.textSize),
      };
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
      if (typeof window === "undefined" || !("caches" in window)) return;

      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.open(k).then((c) => c.keys()))))
        .then((reqs) => {
          this.state.cacheSize = reqs.flat().length * 1000;
          this.notifyListeners();
        })
        .catch((e) => {
          console.warn("Failed to calculate cache size:", e);
        });
    } catch (e) {
      console.warn("Failed to calculate cache size:", e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.getState()));
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
    this.state = { ...DEFAULT_SETTINGS_STATE };
    this.saveToStorage();
    this.notifyListeners();
  }
}

export const settingsStore = new SettingsStore();

/* ------------------------------------------------------------------ */
/* NotificationManager                                                 */
/* ------------------------------------------------------------------ */

export interface NotificationSettings {
  eventReminders: boolean;
  announcements: boolean;
  reminderLeadTime: number;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  eventReminders: false,
  announcements: false,
  reminderLeadTime: 30,
};

class NotificationManager {
  private listeners: Set<(settings: NotificationSettings) => void> = new Set();
  private settings: NotificationSettings = { ...DEFAULT_NOTIFICATION_SETTINGS };

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("swin-app-notifications");
      if (!stored) return;

      const parsed = JSON.parse(stored) as Partial<NotificationSettings>;

      this.settings = {
        ...this.settings,
        ...parsed,
      };
    } catch (e) {
      console.warn("Failed to load notification settings from storage:", e);
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
    this.listeners.forEach((listener) => listener(this.getSettings()));
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      throw new Error("Notifications not supported");
    }

    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    return Notification.requestPermission();
  }

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator
    );
  }

  getPermission(): NotificationPermission {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
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

  async scheduleEventReminder(event: {
    id: string;
    title: string;
    date: string;
    venue: string;
  }) {
    if (!this.settings.eventReminders || this.getPermission() !== "granted") return;

    const eventDate = new Date(event.date);
    const reminderTime = new Date(
      eventDate.getTime() - this.settings.reminderLeadTime * 60 * 1000
    );
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

export function showToast(message: string, duration = 2000): void {
  const toast = document.createElement("div");
  toast.className =
    "fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-sm";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
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
      return;
    }

    fetch("/api/analytics", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {
      /* no-op */
    });
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
    } catch {
      /* no-op */
    } finally {
      globalBookmarksLoaded = true;
    }
  }
}

function persistBookmarks() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("bookmarks", JSON.stringify([...globalBookmarks]));
    } catch {
      /* no-op */
    }
  }
}

function notifyBookmarkListeners() {
  globalListeners.forEach((listener) => listener());
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
    if (stored) {
      return { ...defaultLocaleSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn("Failed to load locale settings:", error);
  }

  return defaultLocaleSettings;
}

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

/* ------------------------------------------------------------------ */
/* ThemeProvider compatibility shim                                    */
/* ------------------------------------------------------------------ */

export function ThemeProvider({ children }: { children: ReactNode }) {
  return children;
}