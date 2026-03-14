"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { copyToClipboard, showToast } from "@/lib/client";
import { formatTimeForDisplay } from "@/lib/utils";
import { getNavHrefForPlace } from "@/lib/navigation";

type Action =
  | { type: "OPEN_SUPPORT"; label: string }
  | { type: "OPEN_NAVIGATION"; label: string; placeId?: string }
  | { type: "OPEN_ROUTE"; label: string; value: string }
  | { type: "OPEN_LINK"; label: string; value: string }
  | { type: "CALL_PHONE"; label: string; value: string }
  | { type: "CALL_SECURITY"; label: string }
  | { type: "COPY_CONTACT"; label: string; value: string };

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
  actions?: Action[];
  suggestedPlaces?: { placeId: string; name: string }[];
  suggestedChips?: { label: string; targetEntryId: string }[];
}

interface AssistantChatProps {
  onClose: () => void;
}

const WELCOME_TEXT =
  "Hi, I'm Swinburne campus assistant.\n\nI can help with navigation, Wi-Fi, Canvas, fees, visa, and support.\n\nWhat do you need help with?";

const FALLBACK_MESSAGE =
  "I couldn't get a reliable answer right now. Please try again or use the Support page.";

const QUICK_START_CHIPS: {
  label: string;
  targetEntryId?: string;
  query?: string;
}[] = [
  { label: "Wi-Fi / eduroam", targetEntryId: "wifi_overview" },
  { label: "Canvas login", targetEntryId: "canvas_login" },
  { label: "Fees & payments", targetEntryId: "fees_overview" },
  { label: "Visa", targetEntryId: "visa_overview" },
  { label: "Find a place", query: "Find a place" },
];

const SECURITY_PHONE = "082-260991";

function AssistantGlyph({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function AssistantAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const small = size === "sm";

  return (
    <span
      className={[
        "flex items-center justify-center ring-1 bg-[#D42A30]/10 text-[#D42A30] ring-[#D42A30]/15",
        small
          ? "h-5 w-5 rounded-[10px] shadow-[0_6px_14px_rgba(212,42,48,.12)]"
          : "h-10 w-10 rounded-2xl shadow-[0_10px_24px_rgba(212,42,48,.14)]",
      ].join(" ")}
      aria-hidden
    >
      <AssistantGlyph className={small ? "h-2.5 w-2.5" : "h-5 w-5"} />
    </span>
  );
}

function isGreetingReply(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("i can help with navigation") ||
    t.includes("pick a topic below") ||
    t.includes("ask me a question")
  );
}

function showQuickStartChips(message: Message): boolean {
  if (message.isUser) return false;
  return message.text === WELCOME_TEXT || isGreetingReply(message.text);
}

function isNavigationMessage(message: Message): boolean {
  const hasPlaces =
    Array.isArray(message.suggestedPlaces) && message.suggestedPlaces.length > 0;

  const navOnly =
    !message.sources?.length &&
    (!message.actions?.length ||
      message.actions.every(
        (action) =>
          action.type === "OPEN_NAVIGATION" || action.type === "OPEN_ROUTE"
      ));

  return hasPlaces && navOnly;
}

function createWelcomeMessage(): Message {
  return {
    id: `welcome-${Date.now()}`,
    text: WELCOME_TEXT,
    isUser: false,
    timestamp: new Date(),
  };
}

function buildHistory(
  messages: Message[],
  maxTurns = 8
): { role: "user" | "assistant"; content: string }[] {
  const out: { role: "user" | "assistant"; content: string }[] = [];

  let count = 0;
  for (let i = messages.length - 1; i >= 0 && count < maxTurns; i -= 1) {
    const message = messages[i];
    if (message.text === WELCOME_TEXT) continue;

    out.unshift({
      role: message.isUser ? "user" : "assistant",
      content: message.text,
    });
    count += 1;
  }

  return out;
}

export default function AssistantChat({ onClose }: AssistantChatProps) {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([createWelcomeMessage()]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef(0);
  const currentDragOffsetRef = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function handleDragStart(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    dragStartYRef.current = clientY;
    currentDragOffsetRef.current = 0;
    setDragOffset(0);
  }

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: TouchEvent | MouseEvent) => {
      e.preventDefault();

      const clientY =
        "touches" in e
          ? (e as TouchEvent).touches[0].clientY
          : (e as MouseEvent).clientY;

      const delta = clientY - dragStartYRef.current;
      if (delta > 0) {
        currentDragOffsetRef.current = delta;
        setDragOffset(delta);
      }
    };

    const handleEnd = () => {
      if (currentDragOffsetRef.current > 100) {
        onClose();
      } else {
        setDragOffset(0);
        currentDragOffsetRef.current = 0;
      }

      setIsDragging(false);
    };

    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);

    return () => {
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    };
  }, [isDragging, onClose]);

  function resetToMainMenu() {
    setIsTyping(false);
    setMessages([createWelcomeMessage()]);
    setInputValue("");
    setCurrentTopic(null);
  }

  async function sendMessage(
    text?: string,
    options?: { targetEntryId?: string; displayLabel?: string }
  ) {
    const cleaned = (text ?? "").trim();
    const targetEntryId = options?.targetEntryId;

    if (!targetEntryId && !cleaned) return;

    const displayText =
      options?.displayLabel ?? (cleaned || targetEntryId || "Message");

    const userMessage: Message = {
      id: String(Date.now()),
      text: displayText,
      isUser: true,
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setIsTyping(true);
    setInputValue("");

    const history = buildHistory(nextMessages);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: targetEntryId ? displayText : cleaned,
          targetEntryId,
          history,
          currentTopic,
        }),
      });

      const data = await res.json().catch(() => ({}));

      const reply: string =
        typeof data.reply === "string" ? data.reply : FALLBACK_MESSAGE;
      const sources: string[] = Array.isArray(data.sources) ? data.sources : [];
      const actions: Action[] = Array.isArray(data.actions) ? data.actions : [];
      const suggestedPlaces = Array.isArray(data.suggestedPlaces)
        ? data.suggestedPlaces
        : undefined;
      const suggestedChips = Array.isArray(data.suggestedChips)
        ? data.suggestedChips
        : undefined;

      if (typeof data.currentTopic === "string" || data.currentTopic === null) {
        setCurrentTopic(data.currentTopic);
      }

      const botMessage: Message = {
        id: String(Date.now() + 1),
        text: reply,
        isUser: false,
        timestamp: new Date(),
        sources: sources.length ? sources : undefined,
        actions: actions.length ? actions : undefined,
        suggestedPlaces,
        suggestedChips,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const fallbackMessage: Message = {
        id: String(Date.now() + 1),
        text: FALLBACK_MESSAGE,
        isUser: false,
        timestamp: new Date(),
        actions: [{ type: "OPEN_SUPPORT", label: "Open Support" }],
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(inputValue);
  }

  function handleAction(action: Action) {
    switch (action.type) {
      case "OPEN_SUPPORT":
        router.push("/support");
        onClose();
        return;

      case "OPEN_NAVIGATION":
        if (action.placeId) {
          const href = getNavHrefForPlace(action.placeId);
          router.push(
            href ?? `/navigate?place=${encodeURIComponent(action.placeId)}`
          );
        } else {
          router.push("/navigate");
        }
        onClose();
        return;

      case "OPEN_ROUTE":
        if (/^https?:\/\//i.test(action.value)) {
          window.location.href = action.value;
        } else {
          router.push(action.value);
          onClose();
        }
        return;

      case "OPEN_LINK":
        window.open(action.value, "_blank", "noopener,noreferrer");
        return;

      case "CALL_PHONE":
        window.location.href = `tel:${String(action.value).replace(/\D/g, "")}`;
        return;

      case "CALL_SECURITY":
        window.location.href = `tel:${SECURITY_PHONE.replace(/\D/g, "")}`;
        return;

      case "COPY_CONTACT":
        copyToClipboard(action.value).then(() => showToast("Copied to clipboard"));
        return;

      default:
        return;
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-end justify-center chat-overlay"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 0.5rem)",
          paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)",
          height: "100dvh",
          overflow: "hidden",
          overscrollBehavior: "none",
        }}
        role="dialog"
        aria-labelledby="chat-title"
      >
        <div
          ref={sheetRef}
          className="relative w-full max-w-2xl px-3 sm:px-6 pointer-events-auto"
          style={{
            transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : "translateY(0)",
            transition: isDragging
              ? "none"
              : "transform 0.35s cubic-bezier(0.22, 0.8, 0.3, 1)",
          }}
        >
          <div
            className="chat-sheet flex flex-col overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.24)] backdrop-blur-xl"
            style={{
              height: "min(88dvh, 920px)",
              maxHeight: "min(88dvh, 920px)",
            }}
          >
            <div
              className="flex-shrink-0 flex justify-center pt-3 pb-2.5 cursor-grab active:cursor-grabbing"
              onTouchStart={handleDragStart}
              onMouseDown={handleDragStart}
            >
              <div
                className="h-1.5 w-14 rounded-full bg-slate-300/80 shadow-[0_1px_0_rgba(255,255,255,0.85)]"
                aria-hidden
              />
            </div>

            <header className="flex-shrink-0 border-b border-slate-100/80 bg-white/95 px-4 pb-4 sm:px-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <AssistantAvatar />

                  <div className="min-w-0">
                    <h2
                      id="chat-title"
                      className="text-[15px] sm:text-base font-semibold tracking-tight text-slate-950 truncate"
                    >
                      Campus Assistant
                    </h2>
                    <p className="mt-0.5 text-[12px] text-slate-500 truncate">
                      Wi-Fi, Canvas, support, navigation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={resetToMainMenu}
                    className="hidden sm:inline-flex items-center rounded-lg border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    New
                  </button>

                  <button
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D42A30]/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
                    aria-label="Close chat"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-50/70">
              <div
                className="chat-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pt-5 pb-4 sm:px-5 overscroll-contain"
                role="log"
                aria-live="polite"
              >
                {messages.map((message, index) => {
                  const previousMessage = index > 0 ? messages[index - 1] : undefined;
                  const nextMessage =
                    index < messages.length - 1 ? messages[index + 1] : undefined;

                  const startsNewExchange =
                    previousMessage && !previousMessage.isUser && message.isUser;

                  const isImmediateBotReply =
                    previousMessage && previousMessage.isUser && !message.isUser;

                  const spacingClass =
                    index === 0
                      ? ""
                      : isImmediateBotReply
                      ? "mt-2"
                      : startsNewExchange
                      ? "mt-5"
                      : "mt-3";

                  const isClusterEnd =
                    !nextMessage || nextMessage.isUser !== message.isUser;

                  const timestampLabel = formatTimeForDisplay(message.timestamp);

                  return (
                    <div
                      key={message.id}
                      className={`${spacingClass} message-enter flex ${
                        message.isUser ? "justify-end" : "justify-start"
                      }`}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      {message.isUser ? (
                        <div className="flex max-w-[82%] flex-col items-end gap-1.5">
                          <div className="w-full rounded-2xl rounded-br-xl bg-slate-950 px-4 py-3 text-[13px] leading-relaxed text-slate-50 shadow-[0_10px_28px_rgba(15,23,42,0.45)]">
                            <p className="whitespace-pre-line text-[13px] tracking-[0.01em]">
                              {message.text}
                            </p>
                          </div>
                          {isClusterEnd && timestampLabel && (
                            <p className="text-[11px] font-medium text-slate-400 pr-1">
                              {timestampLabel}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex max-w-[92%] flex-col gap-2">
                          <div className="flex items-center gap-2 pl-0.5">
                            <AssistantAvatar size="sm" />
                            <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                              Assistant
                            </span>
                          </div>

                          <div className="w-full rounded-2xl rounded-bl-xl border border-slate-200/80 bg-white/95 px-4 py-3.5 text-[13px] leading-relaxed text-slate-800 shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
                            <p className="whitespace-pre-line text-[13px] leading-relaxed tracking-[0.01em]">
                              {message.text}
                            </p>

                            {!isNavigationMessage(message) &&
                              message.sources &&
                              message.sources.length > 0 && (
                                <details className="mt-3 pt-3 border-t border-slate-100 group/sources">
                                  <summary className="list-none cursor-pointer select-none flex items-center gap-2 text-[11px] font-medium text-slate-500 hover:text-slate-700 [&::-webkit-details-marker]:hidden">
                                    <span
                                      className="inline-flex shrink-0 rounded-full bg-slate-100 p-1 text-slate-500 shadow-sm transition-transform duration-200 group-open/sources:rotate-90"
                                      aria-hidden
                                    >
                                      <svg
                                        className="w-3 h-3"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <path d="M9 18l6-6-6-6" />
                                      </svg>
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-600">
                                      Sources ({message.sources.length})
                                    </span>
                                  </summary>

                                  <ul className="mt-2 pl-4 space-y-0.5 text-[12px] text-slate-600">
                                    {message.sources.map((label, i) => (
                                      <li key={i}>{label}</li>
                                    ))}
                                  </ul>
                                </details>
                              )}

                            {(() => {
                              const navAction = message.actions?.find(
                                (action) => action.type === "OPEN_NAVIGATION"
                              );
                              const firstPlace = message.suggestedPlaces?.[0];
                              const place = navAction?.placeId
                                ? message.suggestedPlaces?.find(
                                    (p) => p.placeId === navAction.placeId
                                  )?.name ??
                                  firstPlace?.name ??
                                  navAction.placeId
                                : firstPlace?.name;

                              const hasSingleDestination =
                                message.suggestedPlaces?.length === 1 &&
                                message.actions?.some(
                                  (action) =>
                                    action.type === "OPEN_NAVIGATION" && action.placeId
                                );

                              if (!place || !hasSingleDestination) return null;

                              const openNav = () => {
                                if (navAction?.placeId) {
                                  handleAction(navAction);
                                  return;
                                }

                                if (firstPlace) {
                                  const href = getNavHrefForPlace(firstPlace.placeId);
                                  router.push(
                                    href ??
                                      `/navigate?place=${encodeURIComponent(firstPlace.placeId)}`
                                  );
                                  onClose();
                                }
                              };

                              return (
                                <div className="mt-3 rounded-2xl border border-slate-200/85 bg-slate-50/80 p-3.5 shadow-[0_12px_30px_rgba(15,23,42,0.10)]">
                                  <div className="flex items-start gap-3 mb-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-50 shadow-[0_10px_26px_rgba(15,23,42,0.5)] ring-1 ring-slate-900/70">
                                      <svg
                                        className="w-4 h-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                      </svg>
                                    </span>
                                    <div className="flex flex-col">
                                      <span className="text-[14px] font-semibold text-slate-950">
                                        {place}
                                      </span>
                                      <span className="mt-1 text-[12px] text-slate-600">
                                        Open this destination in the campus navigation module.
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={openNav}
                                    className="w-full rounded-xl bg-slate-950 text-slate-50 py-2.5 text-[13px] font-semibold tracking-[0.01em] shadow-[0_14px_30px_rgba(15,23,42,0.65)] transition-all hover:bg-slate-900 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D42A30]/60 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50"
                                  >
                                    Open Navigation
                                  </button>
                                </div>
                              );
                            })()}

                            {message.suggestedPlaces &&
                              message.suggestedPlaces.length > 0 &&
                              !(
                                message.suggestedPlaces.length === 1 &&
                                message.actions?.some(
                                  (action) =>
                                    action.type === "OPEN_NAVIGATION" && action.placeId
                                )
                              ) && (
                                <div className="mt-3">
                                  <div className="flex flex-wrap gap-2">
                                    {message.suggestedPlaces.map((place) => (
                                      <button
                                        key={place.placeId}
                                        type="button"
                                        onClick={() => void sendMessage(place.name)}
                                        className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
                                      >
                                        {place.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {!isNavigationMessage(message) &&
                              message.text.includes("Support") &&
                              !message.actions?.some(
                                (action) => action.type === "OPEN_SUPPORT"
                              ) && (
                                <div className="mt-3">
                                  <Link
                                    href="/support"
                                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/80 px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all hover:border-slate-300 hover:bg-slate-100"
                                  >
                                    Go to Support →
                                  </Link>
                                </div>
                              )}
                          </div>

                          {showQuickStartChips(message) && (
                            <div className="mt-4">
                              <p className="mb-2.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                Quick start
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {QUICK_START_CHIPS.map((chip) => (
                                  <button
                                    key={chip.label}
                                    type="button"
                                    onClick={() =>
                                      chip.targetEntryId
                                        ? void sendMessage(undefined, {
                                            targetEntryId: chip.targetEntryId,
                                            displayLabel: chip.label,
                                          })
                                        : void sendMessage(chip.query ?? chip.label)
                                    }
                                    className="rounded-full border border-slate-200/90 bg-slate-900/[0.03] px-3.5 py-2 text-[12px] font-semibold text-slate-800 shadow-[0_1px_4px_rgba(15,23,42,0.12)] transition-all hover:border-slate-300 hover:bg-slate-900/[0.05] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D42A30]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
                                  >
                                    {chip.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {message.suggestedChips && message.suggestedChips.length > 0 && (
                            <div className="mt-4">
                              <p className="mb-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                Related
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {message.suggestedChips.map(({ label, targetEntryId }) => (
                                  <button
                                    key={label}
                                    type="button"
                                    onClick={() =>
                                      void sendMessage(undefined, {
                                        targetEntryId,
                                        displayLabel: label,
                                      })
                                    }
                                    className="rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-[11.5px] font-medium text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {!isNavigationMessage(message) &&
                            message.actions &&
                            message.actions.length > 0 &&
                            (() => {
                              const navAction = message.actions.find(
                                (action) => action.type === "OPEN_NAVIGATION"
                              );
                              const place = navAction?.placeId
                                ? message.suggestedPlaces?.find(
                                    (p) => p.placeId === navAction.placeId
                                  )?.name ?? navAction.placeId
                                : message.suggestedPlaces?.[0]?.name;

                              const showNavCard = !!place;

                              const actionsToShow = showNavCard
                                ? message.actions.filter(
                                    (action) => action.type !== "OPEN_NAVIGATION"
                                  )
                                : message.actions;

                              if (actionsToShow.length === 0) return null;

                              return (
                                <div className="mt-3">
                                  <p className="mb-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                                    Actions
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {actionsToShow.map((action, i) => (
                                      <button
                                        key={`${action.label}-${i}`}
                                        type="button"
                                        onClick={() => handleAction(action)}
                                        className="rounded-full border border-slate-900/80 bg-slate-950 px-3.5 py-2 text-[12px] font-medium text-slate-50 shadow-[0_12px_30px_rgba(15,23,42,0.7)] transition-all hover:bg-slate-900 hover:border-slate-900 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D42A30]/55 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
                                      >
                                        {action.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                          {isClusterEnd && timestampLabel && (
                            <p className="self-end text-[11px] font-medium text-slate-400 pl-0.5">
                              {timestampLabel}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div
                    className="message-enter mt-2 flex justify-start"
                    style={{ animationDelay: "0ms" }}
                  >
                    <div className="flex max-w-[92%] flex-col gap-2">
                      <div className="flex items-center gap-2 pl-0.5">
                        <AssistantAvatar size="sm" />
                        <span className="text-[11px] font-medium text-slate-500">
                          Assistant
                        </span>
                      </div>

                      <div className="rounded-2xl rounded-bl-xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                        <div className="flex items-center gap-1.5" aria-label="Thinking">
                          <span className="typing-bar h-2.5 w-4 rounded-full bg-[#D42A30]/35" />
                          <span className="typing-bar h-2.5 w-4 rounded-full bg-[#D42A30]/35" />
                          <span className="typing-bar h-2.5 w-4 rounded-full bg-[#D42A30]/35" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSubmit}
                className="chat-composer flex-shrink-0 flex gap-2 border-t border-slate-100/80 bg-white/98 px-4 py-3 sm:px-5 touch-manipulation z-10"
                style={{
                  paddingBottom: "max(1rem, calc(env(safe-area-inset-bottom) + 0.4rem))",
                }}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question…"
                  className="chat-input flex-1 min-w-0 rounded-full border border-slate-200/80 bg-slate-50/90 px-4 py-3 min-h-[48px] leading-normal text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#D42A30]/55 focus:ring-offset-1 focus:ring-offset-white touch-manipulation"
                  style={{ fontSize: "16px" }}
                  disabled={isTyping}
                  aria-label="Message"
                  autoComplete="off"
                  inputMode="text"
                  enterKeyHint="send"
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  className="chat-send flex-shrink-0 rounded-full bg-slate-950 px-4 py-3 min-h-[48px] leading-normal font-semibold text-slate-50 shadow-[0_16px_32px_rgba(15,23,42,0.6)] transition-all hover:bg-slate-900 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D42A30]/65 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
                  style={{ fontSize: "16px" }}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .chat-overlay {
          background-color: rgba(15, 23, 42, 0.35);
          backdrop-filter: blur(18px);
          touch-action: manipulation;
        }

        .chat-sheet {
          animation: chatSheetIn 0.4s cubic-bezier(0.21, 0.85, 0.3, 1) both;
          transform-origin: bottom center;
        }

        .chat-input {
          -webkit-appearance: none;
          appearance: none;
        }

        .chat-input::placeholder {
          font-size: 16px;
        }

        .chat-scroll {
          -webkit-overflow-scrolling: touch;
          overflow-anchor: auto;
        }

        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .chat-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.4);
          border-radius: 999px;
        }

        .message-enter {
          animation: chatMessageIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes chatSheetIn {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.97);
          }
          55% {
            opacity: 1;
            transform: translateY(-4px) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes chatMessageIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .typing-bar {
          animation: typingBar 1.1s ease-in-out infinite;
        }

        .typing-bar:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing-bar:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes typingBar {
          0%, 100% {
            opacity: 0.35;
            transform: scaleY(0.7);
          }
          50% {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        @media (max-width: 640px) {
          .chat-sheet {
            height: min(86dvh, 860px) !important;
            max-height: min(86dvh, 860px) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .message-enter {
            animation: none;
          }
          .typing-bar {
            animation: none;
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}