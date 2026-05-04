'use client';

import Head from 'next/head';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { routeBank, type RouteId, type RouteScene } from '../route_bank';
import { useRouter } from 'next/navigation';
import { SubpageLayout } from '@/components/SupportUI';

interface PannellumViewer {
  destroy?: () => void;
  resize?: () => void;
}

type PannellumApi = {
  viewer: (el: HTMLElement, opts: Record<string, unknown>) => PannellumViewer;
};

type PannellumWindow = Window & {
  pannellum?: PannellumApi;
};

type HotSpot = {
  pitch: number;
  yaw: number;
  type: 'info';
  createTooltipFunc: (div: HTMLElement) => void;
  clickHandlerFunc?: () => void;
};

export default function Dining360Page() {
  const [mounted, setMounted] = useState(false);
  const [panoReady, setPanoReady] = useState(false);
  const [pannellumLoaded, setPannellumLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [routeMode, setRouteMode] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lastMove, setLastMove] = useState<'forward' | 'back' | null>(null);

  const [nextPanelCollapsed, setNextPanelCollapsed] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const viewerRef = useRef<PannellumViewer | null>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const viewerShellRef = useRef<HTMLDivElement>(null);

  const [routeKey, setRouteKey] = useState<RouteId>('lobby-dining');
  const currentRouteDef = routeBank[routeKey];
  const ROUTE: RouteScene[] = currentRouteDef.scenes;
  const nextOptionsCount = (currentRouteDef.nextRouteIds ?? []).length;

  const router = useRouter();

  const DEFAULT_PANO = '/images360/dining.jpg';

  const guidanceText = useMemo(() => {
    if (!routeMode) return 'Tap “Start Route” to start guided 360° route.';

    if (currentIdx === ROUTE.length - 1) {
      return 'You have reached the destination.';
    }

    return 'Look for the red arrow in front and click it to move forward.';
  }, [routeMode, currentIdx, ROUTE]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const img = new Image();

    img.onload = () => setPanoReady(true);
    img.onerror = () => setErrorMsg('❌ Could not load panorama image.');
    img.src = DEFAULT_PANO;
  }, [DEFAULT_PANO]);

  useEffect(() => {
    const w = window as PannellumWindow;

    if (w.pannellum) {
      setPannellumLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    script.async = true;
    script.onload = () => setPannellumLoaded(true);
    script.onerror = () => setErrorMsg('⚠️ Failed to load Pannellum from CDN.');
    document.body.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
    document.head.appendChild(link);

    return () => {
      viewerRef.current?.destroy?.();
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevOverscroll = html.style.overscrollBehavior;
    const prevTouchAction = body.style.touchAction;

    if (isFullscreen) {
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      html.style.overscrollBehavior = 'none';
      body.style.touchAction = 'none';
    }

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      html.style.overscrollBehavior = prevOverscroll;
      body.style.touchAction = prevTouchAction;
    };
  }, [isFullscreen]);

  useEffect(() => {
    const handleResize = () => {
      window.setTimeout(() => {
        viewerRef.current?.resize?.();
      }, 120);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('load', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('load', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!pannellumLoaded || !panoReady || routeMode) return;
    if (!paneRef.current) return;

    const raf = requestAnimationFrame(() => {
      initViewerDefault();

      requestAnimationFrame(() => {
        viewerRef.current?.resize?.();

        window.setTimeout(() => {
          viewerRef.current?.resize?.();
        }, 180);
      });
    });

    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pannellumLoaded, panoReady, routeMode, isFullscreen]);

  useEffect(() => {
    if (!routeMode || !pannellumLoaded || !panoReady) return;
    if (!paneRef.current) return;

    const raf = requestAnimationFrame(() => {
      initViewerForIndex(currentIdx, lastMove ?? 'forward');

      requestAnimationFrame(() => {
        viewerRef.current?.resize?.();

        window.setTimeout(() => {
          viewerRef.current?.resize?.();
        }, 180);
      });
    });

    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, routeMode, lastMove, pannellumLoaded, panoReady, isFullscreen]);

  const initViewerDefault = () => {
    const w = window as PannellumWindow;
    if (!paneRef.current || !w.pannellum) return;

    try {
      viewerRef.current?.destroy?.();
    } catch {
      // ignore
    }

    viewerRef.current = w.pannellum.viewer(paneRef.current, {
      type: 'equirectangular',
      panorama: DEFAULT_PANO,
      autoLoad: true,
      showZoomCtrl: false,
      showFullscreenCtrl: false,
      compass: true,
      autoRotate: 1,
      hfov: 100,
      minHfov: 60,
      maxHfov: 120,
      backgroundColor: [11, 16, 32],
    });
  };

  const initViewerForIndex = (
    idx: number,
    moveDir: 'forward' | 'back' = 'forward'
  ) => {
    const w = window as PannellumWindow;
    if (!paneRef.current || !w.pannellum) return;

    const scene = ROUTE[idx];

    try {
      viewerRef.current?.destroy?.();
    } catch {
      // ignore
    }

    let startYaw = scene.initialYaw;

    if (moveDir === 'back') {
      startYaw = scene.back ? scene.back.yaw : (scene.initialYaw + 180) % 360;
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

    if (scene.id === 13) {
      hotSpots.push({
        pitch: 0,
        yaw: 195,
        type: 'info',
        createTooltipFunc: (div: HTMLElement) => {
          div.style.background = 'transparent';
          div.style.border = 'none';
          div.style.width = 'auto';
          div.style.height = 'auto';
          div.style.pointerEvents = 'none';

          div.innerHTML = `
            <div style="background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); padding: 12px 16px; border-radius: 12px; border: 2px solid rgba(255, 255, 255, 0.3); text-align: center;">
              <div style="color: #fff; font-size: 14px; font-weight: 600; white-space: nowrap;">You are at Service Desk</div>
            </div>
          `;
        },
      });
    }

    if (scene.id === 17) {
      hotSpots.push({
        pitch: 0,
        yaw: 195,
        type: 'info',
        createTooltipFunc: (div: HTMLElement) => {
          div.style.background = 'transparent';
          div.style.border = 'none';
          div.style.width = 'auto';
          div.style.height = 'auto';
          div.style.pointerEvents = 'none';
        },
      });
    }

    viewerRef.current = w.pannellum.viewer(paneRef.current, {
      type: 'equirectangular',
      panorama: scene.image,
      autoLoad: true,
      yaw: startYaw,
      showZoomCtrl: false,
      showFullscreenCtrl: false,
      compass: true,
      autoRotate: 0,
      hfov: 100,
      minHfov: 60,
      maxHfov: 120,
      backgroundColor: [11, 16, 32],
      hotSpots,
    });
  };

  const handleStartRoute = () => {
    setRouteMode(true);
    setCurrentIdx(0);
    setLastMove('forward');
    setNextPanelCollapsed(true);
  };

  const handleExitRoute = () => {
    setRouteMode(false);
    setCurrentIdx(0);
    setLastMove(null);
    setNextPanelCollapsed(true);
  };

  const handleNext = () => {
    setLastMove('forward');
    setCurrentIdx((i) => Math.min(i + 1, ROUTE.length - 1));
  };

  const handlePrev = () => {
    setLastMove('back');
    setCurrentIdx((i) => Math.max(i - 1, 0));
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((v) => !v);
  };

  const progressPercent = ((currentIdx + 1) / ROUTE.length) * 100;

  const viewerContent = (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        ref={paneRef}
        className={`absolute inset-0 z-0 transition-opacity duration-500 ${
          panoReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {!panoReady && !errorMsg && (
        <div className="absolute inset-0 z-10 grid place-items-center text-sm font-semibold text-white/85">
          Loading 360° viewer…
        </div>
      )}

      {errorMsg && (
        <div className="absolute inset-0 z-10 grid place-items-center px-5 text-center text-sm font-semibold text-red-200">
          {errorMsg}
        </div>
      )}

      {!routeMode && (
        <div
          className={[
            'absolute left-1/2 z-30 w-[calc(100%-24px)] max-w-xs -translate-x-1/2',
            isFullscreen
              ? 'top-[max(1rem,calc(env(safe-area-inset-top)+0.6rem))]'
              : 'top-3',
          ].join(' ')}
        >
          <div className="rounded-2xl border border-white/15 bg-black/45 p-4 text-white shadow-xl backdrop-blur-md">
            <p className="text-sm font-semibold">How to use</p>
            <ul className="mt-2 space-y-1 text-xs text-white/85">
              <li>1. Look around the 360° view.</li>
              <li>2. Tap “Start Route”.</li>
              <li>3. Follow the red arrow forward.</li>
            </ul>
          </div>
        </div>
      )}

      {routeMode && (
        <div
          className={[
            'absolute left-1/2 z-30 -translate-x-1/2',
            isFullscreen
              ? 'top-[max(1rem,calc(env(safe-area-inset-top)+0.6rem))]'
              : 'top-3 md:top-4',
          ].join(' ')}
        >
          <div className="rounded-full border border-white/20 bg-black/45 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md md:text-sm">
            {guidanceText}
          </div>
        </div>
      )}

      {!isFullscreen && (
        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="absolute bottom-20 right-3 z-40 grid h-11 w-11 place-items-center rounded-xl bg-white/90 text-slate-900 shadow-lg ring-1 ring-black/10 backdrop-blur hover:bg-white active:scale-95"
          aria-label="Enter fullscreen"
          title="Fullscreen"
        >
          ⛶
        </button>
      )}

      {isFullscreen && (
        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="absolute right-4 top-[max(1rem,calc(env(safe-area-inset-top)+0.6rem))] z-50 grid h-14 w-14 place-items-center rounded-[22px] bg-white/95 text-4xl leading-none text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.28)] ring-1 ring-black/10 backdrop-blur-md active:scale-95"
          aria-label="Exit fullscreen"
          title="Exit fullscreen"
        >
          ×
        </button>
      )}

      {!routeMode ? (
        <div
          className={[
            'absolute left-1/2 z-40 flex -translate-x-1/2 flex-col items-center',
            isFullscreen
              ? 'bottom-[calc(env(safe-area-inset-bottom)+1.2rem)]'
              : 'bottom-4',
          ].join(' ')}
        >
          <button
            onClick={handleStartRoute}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-6 py-4 text-white shadow-[0_16px_40px_rgba(220,38,38,0.38)] ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            aria-label="Start guided route"
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <span className="relative flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" strokeLinecap="round" />
                  <path
                    d="M13 6l6 6-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span className="flex flex-col items-start text-left leading-tight">
                <span className="text-lg font-bold">Start Route</span>
                <span className="text-xs text-white/85">
                  Guided 360° navigation
                </span>
              </span>
            </span>
          </button>

          {!isFullscreen && (
            <p className="mt-2 rounded-full bg-black/35 px-3 py-1 text-[11px] text-white/85 backdrop-blur-sm">
              Tap to begin step-by-step walkthrough
            </p>
          )}
        </div>
      ) : (
        <div
          className={[
            'absolute left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-white/14 px-3 py-3 shadow-xl backdrop-blur-md',
            isFullscreen
              ? 'bottom-[calc(env(safe-area-inset-bottom)+1rem)]'
              : 'bottom-1',
          ].join(' ')}
        >
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="grid h-12 w-12 place-items-center rounded-full bg-white/80 text-lg font-semibold text-slate-900 shadow disabled:opacity-40"
            aria-label="Previous step"
          >
            ←
          </button>

          <button
            onClick={handleNext}
            disabled={currentIdx === ROUTE.length - 1}
            className="grid h-12 w-12 place-items-center rounded-full bg-red-500 text-lg font-semibold text-white shadow-[0_10px_25px_rgba(239,68,68,0.35)] disabled:opacity-40"
            aria-label="Next step"
          >
            →
          </button>

          <button
            onClick={handleExitRoute}
            className="rounded-full bg-white/75 px-5 py-3 text-sm font-medium text-slate-900 shadow active:scale-95"
          >
            Exit
          </button>
        </div>
      )}

      {isFullscreen && routeMode && (
        <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+5.8rem)] left-1/2 z-30 flex w-[min(92vw,360px)] -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-white shadow-lg backdrop-blur-md">
          <span className="min-w-0 flex-1 truncate text-[11px]">
            {ROUTE[currentIdx].label}
          </span>

          <div className="h-2 w-24 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-red-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="text-[11px] font-medium">
            {currentIdx + 1}/{ROUTE.length}
          </span>
        </div>
      )}

      {routeMode &&
        currentIdx === ROUTE.length - 1 &&
        !nextPanelCollapsed && (
          <div className="swin-next-panel z-50">
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

                    <span className="swin-next-option-icon" aria-hidden="true">
                      →
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setRouteMode(false);
                  setNextPanelCollapsed(true);
                  setIsFullscreen(false);
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

      {routeMode &&
        currentIdx === ROUTE.length - 1 &&
        nextPanelCollapsed && (
          <button
            type="button"
            className="swin-next-toggle-btn z-50"
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

            <span className="swin-next-toggle-chevron" aria-hidden="true">
              ▲
            </span>
          </button>
        )}
    </div>
  );

  return (
    <>
      <Head>
        <title>Dining Route • 360° View</title>
      </Head>

      <SubpageLayout icon="" title="" description="">
        <div className="col-span-full">
          <header className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-red-700 bg-white p-3 shadow-md shadow-red-200">
            <Link
              href="/navigate"
              aria-label="Back"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 bg-white text-slate-900 transition hover:bg-slate-100"
            >
              ←
            </Link>

            <div>
              <h1 className="text-lg font-extrabold text-slate-900">
                Dining Hall
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                360° guided route: {currentRouteDef.title}
              </p>
            </div>
          </header>

          {!isFullscreen && (
            <section
              ref={viewerShellRef}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-xl"
            >
              <div className="relative h-[58vh] w-full bg-black md:h-auto md:aspect-[20/9]">
                {viewerContent}
              </div>

              <div className="z-10 flex items-center justify-between gap-2 border-t border-white/10 bg-slate-900/90 px-3 py-2 text-xs text-slate-300">
                <span className="truncate">
                  {routeMode ? ROUTE[currentIdx].label : 'Dining Area View'}
                </span>

                {routeMode ? (
                  <div className="flex items-center gap-2">
                    <span className="max-w-[95px] truncate text-[10px] text-slate-200/80 md:hidden">
                      {guidanceText}
                    </span>

                    <div className="w-20 overflow-hidden rounded-full bg-slate-700 md:w-28">
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
          )}

          {!isFullscreen && (
            <p className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-center text-sm text-slate-500">
              🖱 Click + drag to look around • 🔍 Scroll to zoom
              <br />
              📍 Tap the arrows or hotspots to move
            </p>
          )}

          {mounted &&
            isFullscreen &&
            createPortal(
              <div className="fixed inset-0 z-[9999] bg-black">
                <div
                  ref={viewerShellRef}
                  className="relative h-[100dvh] w-screen overflow-hidden bg-black"
                >
                  {viewerContent}
                </div>
              </div>,
              document.body
            )}
        </div>
      </SubpageLayout>
    </>
  );
}