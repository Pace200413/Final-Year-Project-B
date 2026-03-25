'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState, useMemo } from 'react';
import { routeBank, type RouteId, type RouteScene } from '../route_bank';
import { useRouter } from 'next/navigation';

/** Minimal Pannellum types (only what we use) */
interface PannellumViewer {
  destroy?: () => void;
  resize?: () => void;
}
type PannellumApi = {
  viewer: (el: HTMLElement, opts: Record<string, unknown>) => PannellumViewer;
};
type PannellumWindow = Window & { pannellum?: PannellumApi };

type HotSpot = {
  pitch: number;
  yaw: number;
  type: 'info';
  createTooltipFunc: (div: HTMLElement) => void;
  clickHandlerFunc?: () => void;
};

export default function GBlock360Page() {
  /* pano / viewer state */
  const [panoReady, setPanoReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* route mode state */
  const [routeMode, setRouteMode] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lastMove, setLastMove] = useState<'forward' | 'back' | null>(null);

  /* NEW: next-destination panel collapsed? (start collapsed like MPH) */
  const [nextPanelCollapsed, setNextPanelCollapsed] = useState(true);

  /* refs to the pannellum viewer + container */
  const viewerRef = useRef<PannellumViewer | null>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  const [routeKey, setRouteKey] = useState<RouteId>('lobby-gblock');
  const currentRouteDef = routeBank[routeKey];
  const ROUTE: RouteScene[] = currentRouteDef.scenes;
  const nextOptionsCount = (currentRouteDef.nextRouteIds ?? []).length; 
  const router = useRouter();

  /* ---------- DEFAULT (non-route) PANORAMA ---------- */
  const DEFAULT_PANO = '/images360/gblock10.jpg';

  /* ---------- ROUTE CONFIG ---------- */
  const guidanceText = useMemo(() => {
    if (!routeMode) return 'Tap “Navigate here” to start guided 360° route.';

    const scene = ROUTE[currentIdx];

    if (currentIdx === ROUTE.length - 1) {
      return 'You have reached the destination.';
    }

    return 'Look for the red arrow in front and click it to move forward.';
  }, [routeMode, currentIdx, ROUTE]);

  /* ---------- preload default pano ---------- */
  useEffect(() => {
    const img = new Image();
    img.onload = () => setPanoReady(true);
    img.onerror = () => setErrorMsg('❌ Could not load panorama image.');
    img.src = DEFAULT_PANO;
  }, [DEFAULT_PANO]);

  /* ---------- inject pannellum script/css ---------- */
  useEffect(() => {
    const w = window as PannellumWindow;
    if (w.pannellum) {
      initViewerDefault();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    script.async = true;
    script.onload = () => initViewerDefault();
    script.onerror = () => setErrorMsg('⚠️ Failed to load Pannellum from CDN.');
    document.body.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
    document.head.appendChild(link);

    return () => {
      viewerRef.current?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- viewer initializers ---------- */

  const initViewerDefault = () => {
    const w = window as PannellumWindow;
    if (!paneRef.current || !w.pannellum) return;

    try {
      viewerRef.current?.destroy?.();
    } catch {
      /* noop */
    }

    viewerRef.current = w.pannellum.viewer(paneRef.current, {
      type: 'equirectangular',
      panorama: DEFAULT_PANO,
      autoLoad: true,
      showZoomCtrl: true,
      showFullscreenCtrl: true,
      compass: true,
      autoRotate: 1,
      hfov: 100,
      minHfov: 60,
      maxHfov: 120,
      backgroundColor: [11, 16, 32],
    });
  };

  const initViewerForIndex = (idx: number, moveDir: 'forward' | 'back' = 'forward') => {
    const w = window as PannellumWindow;
    if (!paneRef.current || !w.pannellum) return;

    const scene = ROUTE[idx];

    try {
      viewerRef.current?.destroy?.();
    } catch {
      /* noop */
    }

    let startYaw = scene.initialYaw;
    if (moveDir === 'back') {
      if (scene.back) {
        startYaw = scene.back.yaw;
      } else {
        startYaw = (scene.initialYaw + 180) % 360;
      }
    }

    const hotSpots: HotSpot[] = [];

    if (scene.forward && idx < ROUTE.length - 1) {
      hotSpots.push({
        pitch: scene.forward.pitch,
        yaw: scene.forward.yaw,
        type: 'info',
        createTooltipFunc: (hotSpotDiv: HTMLElement) => {
          hotSpotDiv.style.background = 'transparent';
          hotSpotDiv.style.border = 'none';
          hotSpotDiv.style.width = 'auto';
          hotSpotDiv.style.height = 'auto';
          hotSpotDiv.innerHTML = `
            <div class="swin-forward-btn">
              <svg viewBox="0 0 24 24" class="swin-forward-icon" aria-hidden="true">
                <path d="M12 17V7" stroke="currentColor" stroke-width="1.95" stroke-linecap="round"/>
                <path d="M7.5 11.5 12 7l4.5 4.5" stroke="currentColor" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          `;
          hotSpotDiv.style.cursor = 'pointer';
        },
        clickHandlerFunc: () => handleNext(),
      });
    }

    if (scene.back && idx > 0) {
      hotSpots.push({
        pitch: scene.back.pitch,
        yaw: scene.back.yaw,
        type: 'info',
        createTooltipFunc: (div: HTMLElement) => {
          const prevLabel =
            typeof idx === 'number' && idx > 0 ? ROUTE[idx - 1].label : '';
          div.style.background = 'transparent';
          div.style.border = 'none';
          div.style.width = 'auto';
          div.style.height = 'auto';
          div.innerHTML = `
          <button
            class="swin-back-vertical pro"
            aria-label="Go back"
            title="Go back"
            type="button"
            ${idx === 0 ? 'disabled' : ''}
          >
            <span class="swin-back-circle">
              <svg viewBox="0 0 24 24" class="swin-back-icon" aria-hidden="true">
                <path d="M12 17V7" stroke="currentColor" stroke-width="1.95" stroke-linecap="round"/>
                <path d="M7.5 11.5 12 7l4.5 4.5" stroke="currentColor" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>
        `;
          div.style.cursor = idx > 0 ? 'pointer' : 'default';
        },
        clickHandlerFunc: () => handlePrev(),
      });
    }

    viewerRef.current = w.pannellum.viewer(paneRef.current, {
      type: 'equirectangular',
      panorama: scene.image,
      autoLoad: true,
      yaw: startYaw,
      showZoomCtrl: true,
      showFullscreenCtrl: true,
      compass: false,
      autoRotate: 0,
      hfov: 100,
      minHfov: 60,
      maxHfov: 120,
      backgroundColor: [11, 16, 32],
      hotSpots,
    });
  };

  /* ---------- react to routeMode / index changes ---------- */
  useEffect(() => {
    if (routeMode) {
      initViewerForIndex(currentIdx, lastMove ?? 'forward');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, routeMode, lastMove]);

  /* ---------- handlers ---------- */
  const handleStartRoute = () => {
    setRouteMode(true);
    setCurrentIdx(0);
    setLastMove('forward');
    setNextPanelCollapsed(true); // collapsed by default like MPH
  };

  const handleExitRoute = () => {
    setRouteMode(false);
    setNextPanelCollapsed(true);
    setTimeout(() => initViewerDefault(), 300);
  };

  const handleNext = () => {
    setLastMove('forward');
    setCurrentIdx((i) => Math.min(i + 1, ROUTE.length - 1));
  };

  const handlePrev = () => {
    setLastMove('back');
    setCurrentIdx((i) => Math.max(i - 1, 0));
  };

  const progressPercent = ((currentIdx + 1) / ROUTE.length) * 100;

  /* ---------- UI ---------- */
  return (
    <>
      <Head>
        <title>G Block • 360° Route</title>
      </Head>

      <main className="flex flex-col h-auto">
        <div className="w-full mx-auto px-2 md:px-4 flex-1">
          {/* Header (same style as the other page) */}
          <header className="flex items-center gap-3 p-3 mb-4 bg-white border-2 border-red-700 rounded-2xl shadow-md shadow-red-200">
            <Link
              href="/navigate"
              aria-label="Back"
              className="grid place-items-center w-10 h-10 border border-slate-300 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition"
            >
              ←
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Multi Purpose Hall</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                360° guided route: {currentRouteDef.title}
              </p>
            </div>
          </header>
          
          {/* Panorama / Viewer shell */}
          <section className="relative border border-slate-200 rounded-2xl bg-slate-950 shadow-xl overflow-hidden">
            <div className="relative w-full h-[58vh] md:h-auto md:aspect-[20/9] bg-black">
              {/* pannellum mounts here */}
              <div
                ref={paneRef}
                className={`absolute inset-0 z-0 transition-opacity duration-500 ${
                  panoReady ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {!panoReady && !errorMsg && (
                <div className="absolute inset-0 grid place-items-center text-slate-300 font-semibold z-10">
                  Loading 360° viewer…
                </div>
              )}
              {errorMsg && (
                <div className="absolute inset-0 grid place-items-center text-red-200 font-semibold z-10">
                  {errorMsg}
                </div>
              )}

              {/* pre-start instructions */}
              {!routeMode && (
                <div className="absolute top-3 right-3 z-20 max-w-xs swin-intro-card">
                  <p className="swin-intro-title">How to use</p>
                  <ul className="swin-intro-list">
                    <li>1. Look around the 360° view.</li>
                    <li>2. Click “Navigate here”.</li>
                    <li>3. Follow the arrow to next point.</li>
                  </ul>
                </div>
              )}

              {/* TOP-CENTER guidance */}
              {routeMode && (
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-4 z-20">
                  <div className="bg-white/90 backdrop-blur-md text-slate-900 rounded-full px-4 py-1.5 text-sm shadow-lg border border-white/70">
                    Follow the arrow to the next point.
                  </div>
                </div>
              )}

              {/* Start vs controls */}
              {!routeMode ? (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-3 items-center">
                  <button
                    onClick={handleStartRoute}
                    className="px-6 py-2 rounded-full font-semibold bg-red-600 text-white shadow-lg hover:bg-red-700 active:scale-95 transition"
                  >
                    Navigate here
                  </button>
                  <p className="hidden md:block text-xs text-white/80 bg-black/30 rounded-full px-3 py-1">
                    We will guide you through the atrium
                  </p>
                </div>
              ) : (
                <div
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-2
                          bg-white/10 backdrop-blur-md px-3 py-2 rounded-full shadow-lg
                          border border-white/20 z-20"
                >
                  <button
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className="swin-ctrl-btn swin-ctrl-btn--prev"
                    aria-label="Previous step"
                  >
                    ←
                    <svg viewBox="0 0 32 32" className="swin-ctrl-arrow swin-ctrl-arrow--prev" aria-hidden="true">
                      <path d="M8 16h16" />
                      <path d="M14 10l-6 6 6 6" />
                    </svg>
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentIdx === ROUTE.length - 1}
                    className="swin-ctrl-btn swin-ctrl-btn--next"
                    aria-label="Next step"
                  >
                    →
                    <svg viewBox="0 0 32 32" className="swin-ctrl-arrow" aria-hidden="true">
                      <path d="M8 16h16" />
                      <path d="M18 10l6 6-6 6" />
                    </svg>
                  </button>
                  <button
                    onClick={handleExitRoute}
                    className="text-[11px] md:text-xs text-black/80 hover:text-white px-1 md:px-2"
                  >
                    Exit
                  </button>
                </div>
              )}

              {/* Next route chooser when user reaches the end */}
              {routeMode &&
                currentIdx === ROUTE.length - 1 &&
                !nextPanelCollapsed && (
                  <div className="swin-next-panel">
                    <div className="swin-next-header">
                      <div className="swin-next-pill">Next destination</div>
                      <button
                        type="button"
                        className="swin-next-close"
                        aria-label="Hide next destinations"
                        onClick={() => setNextPanelCollapsed(true)}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="swin-next-options">
                      {(currentRouteDef.nextRouteIds ?? []).map((nextId) => {
                        const nextDef = routeBank[nextId];
                        return (
                          <button
                            key={nextId}
                            onClick={() => {
                              setRouteKey(nextId);
                              setCurrentIdx(0);
                              setLastMove('forward');
                              setNextPanelCollapsed(true);
                            }}
                            className="swin-next-option"
                          >
                            <div className="swin-next-option-main">
                              <span className="swin-next-option-label">
                                Continue route
                              </span>
                              <span className="swin-next-option-title">
                                {nextDef.title}
                              </span>
                            </div>
                            <span
                              className="swin-next-option-icon"
                              aria-hidden="true"
                            >
                              →
                            </span>
                          </button>
                        );
                      })}

                      <button
                        onClick={() => {
                          setRouteMode(false);
                          setNextPanelCollapsed(true);
                          router.push('/navigate');
                        }}
                        className="swin-next-finish"
                      >
                        <span className="swin-next-finish-main">
                          Finish here
                          <span className="swin-next-finish-sub">
                            Return to the navigation main page
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                )}

              {/* Collapsed “Next destinations” floating button (like MPH) */}
              {routeMode &&
                currentIdx === ROUTE.length - 1 &&
                nextPanelCollapsed && (
                  <button
                    type="button"
                    className="swin-next-toggle-btn"
                    onClick={() => setNextPanelCollapsed(false)}
                    aria-label="Show next destinations"
                    aria-expanded="false"
                  >
                    <div className="swin-next-toggle-left">
                      <div className="swin-next-toggle-main">
                        <span className="swin-next-toggle-title">
                          Next destinations
                        </span>
                        {nextOptionsCount > 0 && (
                          <span className="swin-next-toggle-badge">
                            {nextOptionsCount}
                          </span>
                        )}
                      </div>
                      <span className="swin-next-toggle-meta">
                        Tap to continue route or finish
                      </span>
                    </div>
                    <span
                      className="swin-next-toggle-chevron"
                      aria-hidden="true"
                    >
                      ▲
                    </span>
                  </button>
                )}
            </div>

            {/* Bottom info bar */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-900/90 text-slate-300 text-xs border-t border-white/10 z-10">
              <span className="truncate">
                {routeMode
                  ? ROUTE[currentIdx].label
                  : 'G Block'}
              </span>

              {routeMode ? (
                <div className="flex items-center gap-2">
                  <span className="md:hidden text-[10px] text-slate-200/80 truncate max-w-[95px]">
                    {guidanceText}
                  </span>
                  <div className="w-20 md:w-28 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 bg-red-600 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="hidden md:inline">
                    {currentIdx + 1}/{ROUTE.length}
                  </span>
                </div>
              ) : null}
            </div>
          </section>

          {/* Help / instructions */}
          <p className="mt-4 p-3 bg-white rounded-xl text-center text-slate-500 text-sm border border-slate-200">
            🖱️ Click + drag to look around • 🔍 Scroll to zoom
            <br />
            📱 Tap the arrows or hotspots to move
          </p>
        </div>
      </main>
    </>
  );
}
