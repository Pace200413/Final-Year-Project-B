'use client';

import Head from 'next/head';
import Link from 'next/link';
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

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export default function Study360Page() {
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

  const [routeKey, setRouteKey] = useState<RouteId>('lobby-junction');
  const currentRouteDef = routeBank[routeKey];
  const ROUTE: RouteScene[] = currentRouteDef.scenes;
  const nextOptionsCount = (currentRouteDef.nextRouteIds ?? []).length;

  const router = useRouter();
  const PANO = '/images360/junction1.jpg';

  const guidanceText = useMemo(() => {
    if (!routeMode) return 'Tap “Navigate here” to start guided 360° route.';

    if (currentIdx === ROUTE.length - 1) {
      return 'You have reached the destination.';
    }

    return 'Look for the red arrow in front and click it to move forward.';
  }, [routeMode, currentIdx, ROUTE]);

  useEffect(() => {
    const img = new Image();

    img.onload = () => setPanoReady(true);
    img.onerror = () => setErrorMsg('❌ Could not load panorama image.');
    img.src = PANO;
  }, []);

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
    if (!pannellumLoaded || !panoReady || routeMode) return;
    if (!paneRef.current) return;

    const raf = requestAnimationFrame(() => {
      initViewerDefault();

      requestAnimationFrame(() => {
        viewerRef.current?.resize?.();

        window.setTimeout(() => {
          viewerRef.current?.resize?.();
        }, 150);
      });
    });

    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pannellumLoaded, panoReady, routeMode]);

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
      panorama: PANO,
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

  useEffect(() => {
    if (!routeMode || !pannellumLoaded || !panoReady) return;

    const raf = requestAnimationFrame(() => {
      initViewerForIndex(currentIdx, lastMove ?? 'forward');

      requestAnimationFrame(() => {
        viewerRef.current?.resize?.();
      });
    });

    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, routeMode, lastMove, pannellumLoaded, panoReady]);

  useEffect(() => {
    const getFullscreenElement = () => {
      const doc = document as FullscreenDocument;
      return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
    };

    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(getFullscreenElement()));

      window.setTimeout(() => {
        viewerRef.current?.resize?.();
      }, 120);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverscroll = html.style.overscrollBehavior;

    if (isFullscreen) {
      body.style.overflow = 'hidden';
      html.style.overscrollBehavior = 'none';
    }

    const resizeTimer = window.setTimeout(() => {
      viewerRef.current?.resize?.();
    }, 150);

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overscrollBehavior = previousHtmlOverscroll;
      window.clearTimeout(resizeTimer);
    };
  }, [isFullscreen]);

  const handleStartRoute = () => {
    setRouteMode(true);
    setCurrentIdx(0);
    setLastMove('forward');
    setNextPanelCollapsed(true);
  };

  const handleExitRoute = () => {
    setRouteMode(false);
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

  const progressPercent = ((currentIdx + 1) / ROUTE.length) * 100;

  const handleToggleFullscreen = async () => {
    const el = viewerShellRef.current as FullscreenElement | null;
    if (!el) return;

    const doc = document as FullscreenDocument;
    const fullscreenElement =
      document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;

    try {
      if (isFullscreen || fullscreenElement) {
        if (fullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (doc.webkitExitFullscreen) {
            await doc.webkitExitFullscreen();
          }
        }

        setIsFullscreen(false);

        window.setTimeout(() => {
          viewerRef.current?.resize?.();
        }, 150);

        return;
      }

      if (document.fullscreenEnabled && el.requestFullscreen) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else {
        setIsFullscreen(true);
      }

      window.setTimeout(() => {
        viewerRef.current?.resize?.();
      }, 150);
    } catch (err) {
      console.warn('Native fullscreen failed, using app fullscreen instead:', err);
      setIsFullscreen(true);

      window.setTimeout(() => {
        viewerRef.current?.resize?.();
      }, 150);
    }
  };

  return (
    <>
      <Head>
        <title>Study Route • 360° Route</title>
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
                Junction & Study Area
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                360° guided route: {currentRouteDef.title}
              </p>
            </div>
          </header>

          <section
            ref={viewerShellRef}
            className={[
              'relative overflow-hidden bg-slate-950',
              isFullscreen
                ? 'fixed inset-0 z-[100] h-[100dvh] w-screen rounded-none border-0 shadow-none'
                : 'rounded-2xl border border-slate-200 shadow-xl',
            ].join(' ')}
          >
            <div
              className={`relative w-full bg-black ${
                isFullscreen
                  ? 'h-[calc(100dvh-42px)]'
                  : 'h-[58vh] md:h-auto md:aspect-[20/9]'
              }`}
            >
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="absolute bottom-20 right-3 z-30 grid h-11 w-11 place-items-center rounded-xl bg-white/90 text-slate-900 shadow-lg ring-1 ring-black/10 hover:bg-white"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? '✕' : '⛶'}
              </button>

              <div
                ref={paneRef}
                className={`absolute inset-0 z-0 transition-opacity duration-500 ${
                  panoReady ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {!panoReady && !errorMsg && (
                <div className="absolute inset-0 z-10 grid place-items-center font-semibold text-slate-300">
                  Loading 360° viewer…
                </div>
              )}

              {errorMsg && (
                <div className="absolute inset-0 z-10 grid place-items-center font-semibold text-red-200">
                  {errorMsg}
                </div>
              )}

              {!routeMode && (
                <div className="swin-intro-card absolute left-1/2 top-3 z-20 w-[calc(100%-24px)] max-w-xs -translate-x-1/2 md:left-auto md:right-3 md:w-auto md:translate-x-0">
                  <p className="swin-intro-title">How to use</p>
                  <ul className="swin-intro-list">
                    <li>1. Look around the 360° view.</li>
                    <li>2. Click “Navigate here”.</li>
                    <li>3. Follow the arrow to next point.</li>
                  </ul>
                </div>
              )}

              {routeMode && (
                <div className="absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 md:block">
                  <div className="rounded-full border border-white/70 bg-white/90 px-4 py-1.5 text-sm text-slate-900 shadow-lg backdrop-blur-md">
                    Follow the arrow to the next point.
                  </div>
                </div>
              )}

              {!routeMode ? (
                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center">
                  <button
                    onClick={handleStartRoute}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-5 py-3 text-white shadow-[0_12px_30px_rgba(220,38,38,0.35)] ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(220,38,38,0.45)] active:scale-95 md:px-6 md:py-3.5"
                    aria-label="Start guided route"
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <span className="relative flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/18 ring-1 ring-white/20 backdrop-blur-sm">
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
                        <span className="text-base font-bold md:text-lg">
                          Start Route
                        </span>
                        <span className="text-[11px] text-white/85 md:text-xs">
                          Guided 360° navigation
                        </span>
                      </span>
                    </span>
                  </button>

                  <p className="mt-2 rounded-full bg-black/35 px-3 py-1 text-[11px] text-white/85 backdrop-blur-sm">
                    Tap to begin step-by-step walkthrough
                  </p>
                </div>
              ) : (
                <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 shadow-lg backdrop-blur-md">
                  <button
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className="swin-ctrl-btn swin-ctrl-btn--prev"
                    aria-label="Previous step"
                  >
                    ←
                    <svg
                      viewBox="0 0 32 32"
                      className="swin-ctrl-arrow swin-ctrl-arrow--prev"
                      aria-hidden="true"
                    >
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
                    <svg
                      viewBox="0 0 32 32"
                      className="swin-ctrl-arrow"
                      aria-hidden="true"
                    >
                      <path d="M8 16h16" />
                      <path d="M18 10l6 6-6 6" />
                    </svg>
                  </button>

                  <button
                    onClick={handleExitRoute}
                    className="px-1 text-[11px] text-black/80 hover:text-white md:px-2 md:text-xs"
                  >
                    Exit
                  </button>
                </div>
              )}

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

                    <span className="swin-next-toggle-chevron" aria-hidden="true">
                      ▲
                    </span>
                  </button>
                )}
            </div>

            <div className="z-10 flex items-center justify-between gap-2 border-t border-white/10 bg-slate-900/90 px-3 py-2 text-xs text-slate-300">
              <span className="truncate">
                {routeMode
                  ? ROUTE[currentIdx].label
                  : 'Borneo Atrium • Block A/B Entrance'}
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

          {!isFullscreen && (
            <p className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-center text-sm text-slate-500">
              🖱️ Click + drag to look around • 🔍 Scroll to zoom
              <br />
              📱 Tap the arrows or hotspots to move
            </p>
          )}
        </div>
      </SubpageLayout>
    </>
  );
}