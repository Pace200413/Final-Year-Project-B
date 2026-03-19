'use client';

import Head from 'next/head';
import Script from 'next/script';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

/** Minimal Pannellum types (only what we use) */
interface PannellumViewer {
  destroy?: () => void;
  resize?: () => void;
}
type PannellumApi = {
  viewer: (el: HTMLElement, opts: Record<string, unknown>) => PannellumViewer;
};
type PannellumWindow = Window & { pannellum?: PannellumApi };

type Dot = { id: number; left: string; top: string };

// --- Map dots (percent positions) ---
const DOTS: Dot[] = [
  { id: 1, left: '37.30%', top: '70.04%' },
  { id: 2, left: '37.70%', top: '47.92%' },
  { id: 3, left: '36.25%', top: '26.88%' },
  { id: 4, left: '32.93%', top: '17.92%' },
  { id: 5, left: '44.53%', top: '15.92%' },
  { id: 6, left: '48.20%', top: '28.70%' },
  { id: 7, left: '44.22%', top: '41.00%' },
  { id: 8, left: '55.50%', top: '51.50%' },
  { id: 9, left: '44.95%', top: '55.58%' },
  { id: 10, left: '48.50%', top: '63.50%' },
  { id: 11, left: '52.70%', top: '78.00%' },
  { id: 12, left: '53.50%', top: '70.69%' },
];

const INFO: Record<number, { title?: string; img?: string; desc?: string }> = {
  12: {
    title: 'Borneo Atrium',
    img: '/images/borneoatrium_pic.jpg',
    desc: 'Central atrium beside Block G, often used for events and exhibitions.',
  },
  11: {
    title: 'Block E',
    img: '/images/blockE_pic.jpg',
    desc: 'Houses Engineering labs, the AI Lab, academic staff offices, and meeting rooms.',
  },
  10: {
    title: 'Junction',
    img: '/images/junction1_pic.jpg',
    desc: 'Common study spot with discussion areas and seating.',
  },
  9: {
    title: 'Library',
    img: '/images/library_pic.jpg',
    desc: 'Quiet study zone with individual and group study facilities.',
  },
  8: {
    title: 'Lecture Theatre',
    img: '/images/lecturetheatre_pic.jpg',
    desc: 'Main lecture hall for large classes and talks.',
  },
  7: {
    title: 'G Block',
    img: '/images/blockg_pic.jpg',
    desc: 'Home to IT-related departments and support facilities.',
  },
  6: {
    title: 'Dining Hall',
    img: '/images360/diningpic.jpg',
    desc: 'Campus cafeteria serving meals, snacks, and drinks.',
  },
  5: {
    title: 'Student Hub',
    img: '/images/shub_pic.jpg',
    desc: 'Relaxation and social area for students with casual seating.',
  },
  4: {
    title: 'Student Village Hostel',
    img: '/images/sv_inside_pic.jpg',
    desc: 'On-campus student accommodation with separate male and female blocks.',
  },
  3: {
    title: 'Student Village Main Door',
    img: '/images/sv_outside_pic.jpg',
    desc: 'Main entrance to the hostel area, with an office for access control and enquiries.',
  },
  2: {
    title: 'Multi-Purpose Hall (MPH)',
    img: '/images/mph_pic.jpg',
    desc: 'Indoor sports and activity hall for badminton, basketball, squash, and gym use.',
  },
  1: {
    title: 'Carpark Building',
    img: '/images/parking_pic.jpg',
    desc: 'Multi-storey car park with convenient access from Jalan Uplands.',
  },
};

// --- 360 files under /public/images360 ---
const PANOS: Record<number, string> = {
  1: '/images360/carpark1.jpg',
  2: '/images360/L-M-18.jpg',
  3: '/images360/sv_outside.jpg',
  4: '/images360/sv_inside.jpg',
  5: '/images360/shub_L1.jpg',
  6: '/images360/dining.jpg',
  7: '/images360/gblock10.jpg',
  8: '/images360/lecturetheatre.jpg',
  9: '/images360/library12.jpg',
  10: '/images360/junction1.jpg',
  11: '/images360/blockE.jpg',
  12: '/images360/borneo_atrium.jpg',
};

// quick check if an image is ~2:1 equirectangular
function isEquirectangular(url: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(Math.abs(img.width - 2 * img.height) <= 2);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export default function CampusMapPage() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [panoReady, setPanoReady] = useState(false);
  const [touchTooltipId, setTouchTooltipId] = useState<number | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);
  const touchHideTimer = useRef<number | null>(null);


  // Init / destroy viewer when a dot is opened
  useEffect(() => {
    if (touchHideTimer.current) {
      window.clearTimeout(touchHideTimer.current);
    }
    if (openId === null || !panoReady || !hostRef.current) return;

    const panoUrl = PANOS[openId];
    if (!panoUrl) return;

    const w = window as PannellumWindow;
    if (!w.pannellum) return;

    // cleanup any previous viewer
    try {
      viewerRef.current?.destroy?.();
    } catch {
      /* noop */
    }
    hostRef.current.innerHTML = '';

    let removeResize: (() => void) | undefined;

    (async () => {
      const ok = await isEquirectangular(panoUrl);
      if (!ok) {
        console.warn('Image is not 2:1 equirectangular — may look warped:', panoUrl);
      }

      viewerRef.current = w.pannellum!.viewer(hostRef.current!, {
        type: 'equirectangular',
        panorama: panoUrl,
        autoLoad: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        compass: false,
        hfov: 100,
        minHfov: 60,
        maxHfov: 120,
      });

      const resize = () => viewerRef.current?.resize?.();
      resize();
      requestAnimationFrame(resize);
      window.addEventListener('resize', resize);
      removeResize = () => window.removeEventListener('resize', resize);
    })();

    return () => {
      removeResize?.();
      try {
        viewerRef.current?.destroy?.();
      } catch {
        /* noop */
      }
      viewerRef.current = null;
    };
  }, [openId, panoReady]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenId(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (touchHideTimer.current) {
        window.clearTimeout(touchHideTimer.current);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Campus Map • 360°</title>
        <link rel="stylesheet" href="/vendor/pannellum/pannellum.css" />
      </Head>

      {/* Pannellum JS: local with CDN fallback */}
      <Script
        src="/vendor/pannellum/pannellum.js"
        strategy="afterInteractive"
        onLoad={() => setPanoReady(true)}
        onError={() => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
          s.onload = () => setPanoReady(true);
          s.onerror = () => console.error('Failed to load Pannellum (local + CDN).');
          document.body.appendChild(s);
        }}
      />
    
      <main className="flex flex-col h-auto">
        <div className="w-full mx-auto px-2 md:px-4 py-3 md:py-6 flex-1">
          {/* Header */}
          <header className="flex items-center gap-3 p-3 mb-4 bg-white border-2 border-red-700 rounded-2xl shadow-md shadow-red-200">
            <Link
              href="/navigate"
              aria-label="Back"
              className="grid place-items-center w-10 h-10 border border-slate-300 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition"
            >
              ←
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Campus Map</h1>
              <p className="text-sm text-slate-500 mt-0.5">Tap a hotspot to open the 360° view</p>
            </div>
          </header>

        
          {/* Intro */}
          <section className="mb-4">
            <h2 className="text-base md:text-lg font-semibold text-slate-800">
              Swinburne Sarawak Campus Map
            </h2>
            <p className="text-sm text-slate-500">
              Hover/tap a dot to see the place name, then click to launch the 360° viewer.
            </p>
          </section>

          {/* Map card */}
          <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm campus-map-layer">
            <div className="relative w-full max-w-5xl mx-auto aspect-[16/10] bg-slate-100 rounded-t-2xl">
              <img
                src="/images/swinmap.jpg"
                alt="Campus map"
                className="absolute inset-0 w-full h-full object-contain"
              />

              {DOTS.map((d) => (
                <button
                  key={d.id}
                  className="group map-dot dot-red absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
                  style={{ left: d.left, top: d.top } as React.CSSProperties}
                  aria-label={`Open 360° view: ${INFO[d.id]?.title ?? `Location ${d.id}`}`}
                  onClick={() => setOpenId(d.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenId(d.id);
                    }
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setTouchTooltipId(d.id);

                    if (touchHideTimer.current) {
                      window.clearTimeout(touchHideTimer.current);
                    }
                    touchHideTimer.current = window.setTimeout(() => {
                      setTouchTooltipId((curr) => (curr === d.id ? null : curr));
                    }, 2500);
                  }}
                  onTouchCancel={() => {
                    setTouchTooltipId((curr) => (curr === d.id ? null : curr));
                  }}
                >
                  {/* tooltip */}
                  <div
                    className={[
                      'map-tooltip absolute left-1/2 bottom-7 -translate-x-1/2 pointer-events-none transition',
                      touchTooltipId === d.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    ].join(' ')}
                  >

                    <div className="tooltip-box w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-2 flex gap-2">
                      {INFO[d.id]?.img ? (
                        <img
                          src={INFO[d.id]!.img!}
                          alt={INFO[d.id]?.title || ''}
                          className="w-auto h-20 rounded-lg object-cover bg-slate-200 flex-shrink-0"
                        />
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800 mb-0.5">
                          {INFO[d.id]?.title ?? `Location #${d.id}`}
                        </div>
                        <div className="text-[0.65rem] text-slate-500 leading-snug line-clamp-3">
                          {INFO[d.id]?.desc ?? 'Tap to open 360° view.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* bottom bar */}
            <div className="px-4 py-2 text-xs text-slate-400 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
              🗺️ Map pins are approximate — use 360° view for actual surroundings.
            </div>
          </div>


          <p className="mt-4 p-3 bg-white rounded-xl text-center text-slate-500 text-sm border border-slate-200">
            🖱️ Click + drag to look around (inside viewer) • 🔍 Scroll to zoom
          </p>
        </div>
      </main>

      {/* 360 MODAL */}
      {openId !== null && (
        <div
          className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center px-2 md:px-6"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.currentTarget === e.target && setOpenId(null)}
        >
          <div className="w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
            {/* header */}
            <header className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 grid place-items-center rounded-lg bg-slate-900 text-slate-200 hover:bg-slate-800"
                  onClick={() => setOpenId(null)}
                  aria-label="Close viewer"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-sm md:text-base font-semibold text-white">
                    {INFO[openId!]?.title ?? `Location #${openId}`}
                  </h1>
                  <p className="text-xs text-slate-400">360° viewer</p>
                </div>
              </div>
              <button
                onClick={() => setOpenId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 text-xs font-medium hover:bg-white"
              >
                Close
              </button>
            </header>

            <div className="relative w-full aspect-[16/9] bg-black">
              <div
                ref={hostRef}
                className="absolute inset-0 rounded-none md:rounded-b-2xl overflow-hidden"
              />
              {!panoReady && (
                <div className="absolute inset-0 grid place-items-center text-slate-200 text-sm">
                  Loading 360° viewer…
                </div>
              )}
            </div>

            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[0.65rem] text-white backdrop-blur-md">
              360° Viewer
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}