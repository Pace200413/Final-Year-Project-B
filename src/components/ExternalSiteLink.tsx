"use client";

import { useMemo, useState, type AnchorHTMLAttributes, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import {
  getResolvedExternalLinkAction,
  useDevicePrefs,
  type ExternalLinkAction,
} from "@/lib/device-prefs";

type ExternalSiteLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "children"
> & {
  href: string;
  children: ReactNode;
  titleText?: string;
};

function isExternalHttpLink(href: string) {
  return /^https?:\/\//i.test(href);
}

export default function ExternalSiteLink({
  href,
  children,
  className,
  titleText = "external site",
  ...rest
}: ExternalSiteLinkProps) {
  const { prefs, setPrefs } = useDevicePrefs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);

  const resolvedAction = useMemo(
    () => getResolvedExternalLinkAction(prefs),
    [prefs]
  );

  function openExternal(action: ExternalLinkAction) {
    if (rememberChoice && prefs.rememberExternalLinkPreference) {
      setPrefs({ rememberedExternalLinkAction: action });
    }

    if (action === "new-tab") {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.assign(href);
    }

    setDialogOpen(false);
    setRememberChoice(false);
  }

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!isExternalHttpLink(href)) return;

    e.preventDefault();

    if (!prefs.confirmBeforeExternalSites) {
      openExternal(resolvedAction);
      return;
    }

    if (prefs.rememberExternalLinkPreference && prefs.rememberedExternalLinkAction) {
      const ok = window.confirm(`Open ${titleText}?`);
      if (!ok) return;
      openExternal(resolvedAction);
      return;
    }

    setDialogOpen(true);
  }

  return (
    <>
      <a
        {...rest}
        href={href}
        onClick={handleClick}
        className={className}
        rel="noopener noreferrer"
      >
        {children}
      </a>

      {dialogOpen ? (
        <div className="fixed inset-0 z-[140] bg-slate-950/45 p-4">
          <div className="mx-auto mt-[12vh] w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#F2F2F7] text-slate-700">
                  <ExternalLink className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-900">
                    Open external site
                  </h3>
                  <p className="mt-1 text-sm leading-snug text-slate-600">
                    {titleText} is outside the campus app.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-2xl border border-slate-200 bg-[#F2F2F7] px-4 py-3 text-sm text-slate-600">
                Choose how you want to open it this time.
              </div>

              {prefs.rememberExternalLinkPreference ? (
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberChoice}
                    onChange={(e) => setRememberChoice(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Remember this choice on this device
                </label>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                  Turn on <span className="font-medium text-slate-700">Remember external-link preference</span> in Settings if you want the app to remember your choice.
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openExternal("same-tab")}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Open here
                </button>

                <button
                  type="button"
                  onClick={() => openExternal("new-tab")}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm"
                >
                  Open in new tab
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDialogOpen(false);
                  setRememberChoice(false);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}