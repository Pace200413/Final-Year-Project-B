'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaMapMarkedAlt,
  FaUtensils,
  FaBook,
  FaBookOpen,
  FaInfoCircle,
  FaBuilding,
  FaUsers,
  FaQrcode,
  FaLink,
  FaImage,
  FaShieldAlt,
  FaRedo,
  FaUniversity,
  FaLaptopCode ,
  FaMapMarkerAlt, 
  FaWalking,
} from 'react-icons/fa';

import type { IconType } from 'react-icons';
import {SubpageLayout} from '@/components/SupportUI';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import type { Result } from '@zxing/library';

/* ================= Permissions helpers ================= */

const isHttps = () =>
  typeof window !== 'undefined' &&
  (location.protocol === 'https:' || location.hostname === 'localhost');

const hasCam = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

const hasSpeech = () =>
  typeof window !== 'undefined' &&
  (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window));

type CameraMicPermissionName = 'camera' | 'microphone';
type PermissionQuery = PermissionDescriptor | { name: CameraMicPermissionName };

async function ensurePermission(kind: 'camera' | 'microphone'): Promise<{ ok: boolean; reason?: string }> {
  if (!isHttps()) return { ok: false, reason: 'Needs HTTPS (or localhost).' };
  const constraints: MediaStreamConstraints = kind === 'camera' ? { video: true } : { audio: true };

  try {
    if (navigator.permissions) {
      const status = await navigator.permissions.query(
        { name: kind as CameraMicPermissionName } as PermissionQuery
      );
      if (status.state === 'denied') {
        return { ok: false, reason: `${kind} permission is blocked in browser settings.` };
      }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach((t) => t.stop());
    return { ok: true };
  } catch (e) {
    const err = e as { name?: string };
    const msg =
      err?.name === 'NotAllowedError'
        ? `${kind} permission denied.`
        : err?.name === 'NotFoundError'
        ? `No ${kind} device found.`
        : `Could not access ${kind}.`;
    return { ok: false, reason: msg };
  }
}

/* ================= Web Speech minimal typings ================= */

type SpeechRecognitionAlternativeLike = { transcript: string };
type SpeechRecognitionResultLike = { 0: SpeechRecognitionAlternativeLike; isFinal: boolean };
type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (e: SpeechRecognitionEventLike) => void;
  onerror: (e: unknown) => void;
  onend: () => void;
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

/* ================= SearchBar ================= */

function SearchBar({
  onSearch,
  onSubmit,
  onScan,
  className = '',
  defaultValue = '',
}: {
  onSearch?: (q: string) => void;
  onSubmit?: (q: string) => void;
  onScan?: () => void;
  className?: string;
  defaultValue?: string;
}) {
  const [q, setQ] = useState(defaultValue);
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!onSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onSearch(q.trim());
      setIsTyping(false);
    }, 300);
  }, [q, onSearch]);

  useEffect(() => {
    const W = window as SpeechWindow;
    const Ctor = (W.SpeechRecognition ?? W.webkitSpeechRecognition) as
      | (new () => SpeechRecognitionLike)
      | undefined;

    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    recognitionRef.current = rec;

    rec.onresult = (e: SpeechRecognitionEventLike) => {
      let text = '';
      let isFinal = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        text += res[0].transcript;
        if (res.isFinal) isFinal = true;
      }
      setQ(text.trim());
      setIsTyping(true);

      if (isFinal) {
        setListening(false);
        setIsTyping(false);
        onSearch?.(text.trim());
        onSubmit?.(text.trim());
        inputRef.current?.focus();
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    return () => {
      try {
        rec.abort();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    };
  }, [onSearch, onSubmit]);

  const submit = () => onSubmit?.(q.trim());
  const clear = () => {
    setQ('');
    inputRef.current?.focus();
    onSearch?.('');
  };

  const toggleMic = async () => {
    if (!hasSpeech()) {
      alert('Voice search isn’t available in this browser.');
      return;
    }
    const { ok, reason } = await ensurePermission('microphone');
    if (!ok) {
      alert(reason || 'Microphone blocked.');
      return;
    }
    const rec = recognitionRef.current;
    if (!rec) {
      alert('Voice search failed to initialize. Try Chrome or Edge.');
      return;
    }
    try {
      if (!listening) {
        setListening(true);
        rec.start();
      } else {
        setListening(false);
        rec.stop();
      }
    } catch {
      setListening(false);
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    }
  };

  return (
    <div
      className={`sticky top-20 md:top-20 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200 ${className}`}
      role="search"
      aria-label="Campus search"
    >
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="group flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 pl-3 pr-1 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-300">
          <svg className="h-5 w-5 shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIsTyping(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder='Search buildings, “Dining Hall”, “Borneo Atrium”…'
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
            aria-label="Search campus"
            autoComplete="off"
          />

          {q && (
            <button onClick={clear} className="rounded-full p-1.5 hover:bg-slate-100" aria-label="Clear search">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          <button
            onClick={toggleMic}
            className={`ml-auto rounded-full p-1.5 hover:bg-slate-100 ${listening ? 'ring-2 ring-blue-500/60' : ''}`}
            aria-label={listening ? 'Stop voice search' : 'Start voice search'}
            title="Voice search"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill={listening ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
              <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>

          <button onClick={onScan} className="rounded-full p-1.5 hover:bg-slate-100" aria-label="Open scanner" title="Scan room/building QR">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm14 0h2v6h-6v-2h4v-4z" />
            </svg>
          </button>

          {isTyping && (
            <span className="ml-1 text-xs text-slate-500" aria-live="polite">
              {listening ? 'listening…' : 'searching…'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
/* ===== End SearchBar ===== */

/* ================= Manual code & Upload QR ================= */

function ManualCode({ onDone }: { onDone: () => void }) {
  const [val, setVal] = useState('');
  const router = useRouter();

  const go = () => {
    const text = val.trim();
    if (!text) return;
    if (/^https?:\/\//i.test(text)) window.location.href = text;
    else router.push(`/maps?code=${encodeURIComponent(text)}`);
    onDone();
  };

  return (
    <div className="rounded-2xl border border-[#C8102E]/40 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-700">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8102E]/10">
          <FaLink className="h-4 w-4 text-[#C8102E]" />
        </span>
        <div>
          <p className="font-medium">Enter code or URL</p>
          <p className="text-xs text-slate-500">
            Example: <code className="font-mono">LIB-203</code> or a full <code>https://</code> link
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="flex-1 rounded-xl border border-[#C8102E]/40 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#C8102E]/40"
          placeholder="e.g. LIB-203 or https://…"
          aria-label="Enter room code or URL"
        />
        <button
          onClick={go}
          className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 active:scale-[0.99]"
        >
          Go
        </button>
      </div>
    </div>
  );
}

function UploadQr({ onDone }: { onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const reader = new BrowserMultiFormatReader();
      const img = new Image();
      img.onload = async () => {
        try {
          const res: Result = await reader.decodeFromImageElement(img);
          const text = res.getText();
          if (/^https?:\/\//i.test(text)) window.location.href = text;
          else router.push(`/maps?code=${encodeURIComponent(text)}`);
          onDone();
        } catch {
          alert('Could not read a QR code from that image.');
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.src = url;
    } catch {
      URL.revokeObjectURL(url);
      alert('Image QR decoding failed.');
    }
  };

  return (
    <div className="rounded-2xl border border-[#C8102E]/40 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-700">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8102E]/10">
          {/* fixed extra } */}
          <FaImage className="h-4 w-4 text-[#C8102E]" />
        </span>
        <div>
          <p className="font-medium">Upload QR image</p>
          <p className="text-xs text-slate-500">PNG/JPG from your gallery or screenshot</p>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={[
          'mt-3 grid place-items-center rounded-xl border border-dashed p-6 text-center transition-colors',
          dragOver ? 'border-[#C8102E] bg-[#C8102E]/5' : 'border-[#C8102E]/40',
        ].join(' ')}
      >
        <p className="text-sm text-slate-600">
          Drag &amp; drop an image here <span className="text-slate-400">or</span>
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[#C8102E]/50 px-3 py-2 text-sm text-[#C8102E] hover:bg-[#C8102E]/5"
        >
          Choose file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

/* ================= QR Map panel (2D map in a modal) ================= */

type QRLocationKey = 'lobby' | 'atrium' | 'library' | 'mph' | 'gblock';

type QRLocation = {
  key: QRLocationKey;
  label: string;
  description: string;
  x: number; // position on map (%)
  y: number;
  routeHref: string; // where to go when “Start route” is clicked
};

const QR_LOCATIONS: QRLocation[] = [
  {
    key: 'lobby',
    label: 'Main Lobby',
    description: 'Campus main entrance and reception area.',
    x: 40,
    y: 70,
    routeHref: '/navigate/map?from=lobby&to=lobby',
  },
  {
    key: 'atrium',
    label: 'Borneo Atrium',
    description: 'Event space and hangout area.',
    x: 55,
    y: 55,
    routeHref: '/navigate/map?from=lobby&to=borneo_atrium',
  },
  {
    key: 'library',
    label: 'Library',
    description: 'Resources, quiet zones and study rooms.',
    x: 30,
    y: 40,
    routeHref: '/navigate/map?from=lobby&to=library',
  },
  {
    key: 'mph',
    label: 'Multi Purpose Hall',
    description: 'Exams, events and large assemblies.',
    x: 75,
    y: 30,
    routeHref: '/navigate/map?from=lobby&to=mph',
  },
  {
    key: 'gblock',
    label: 'G Block (IT & Student Service)',
    description: 'IT department, labs and student service counters.',
    x: 15,
    y: 55,
    routeHref: '/navigate/map?from=lobby&to=gblock',
  },
];

function getQrLocation(key: QRLocationKey | null): QRLocation {
  const loc = key ? QR_LOCATIONS.find((l) => l.key === key) : undefined;
  return loc ?? QR_LOCATIONS[0]; // default lobby
}

function QrMapPanel({ startKey }: { startKey: QRLocationKey }) {
  const router = useRouter();
  const startLocation = getQrLocation(startKey);
  const [selectedKey, setSelectedKey] = useState<QRLocationKey | null>(null);

  const selectedLocation = useMemo(
    () =>
      selectedKey
        ? (QR_LOCATIONS.find((l) => l.key === selectedKey) ?? null)
        : null,
    [selectedKey]
  );

  const handleStartRoute = () => {
    if (!selectedLocation) return;
    router.push(selectedLocation.routeHref);
  };

  return (
    <div className="space-y-4">
      {/* Header inside modal */}
      <header className="rounded-2xl border border-red-700 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-lg">
            🗺️
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              2D Campus Map (QR)
            </h2>
            <p className="text-xs text-slate-500">
              You are here:{' '}
              <span className="font-semibold">{startLocation.label}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* 2D map area */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Swinburne Sarawak 2D Map
            </h3>
            <p className="text-[11px] text-slate-500">
              Tap a pin or card to choose your destination
            </p>
          </div>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
            {/* TODO: replace with real map image if you have */}
            <div className="pointer-events-none absolute left-[20%] top-[45%] h-20 w-24 rounded-xl bg-white/80 shadow" />
            <div className="pointer-events-none absolute left-[52%] top-[30%] h-24 w-28 rounded-xl bg-white/80 shadow" />
            <div className="pointer-events-none absolute left-[35%] top-[25%] h-16 w-20 rounded-xl bg-white/80 shadow" />

            {/* You are here */}
            <button
              type="button"
              className="absolute -translate-x-1/2 -translate-y-full rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white shadow-lg"
              style={{ left: `${startLocation.x}%`, top: `${startLocation.y}%` }}
            >
              You are here
            </button>
            <div
              className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-600 shadow-md"
              style={{ left: `${startLocation.x}%`, top: `${startLocation.y}%` }}
            >
              <FaMapMarkerAlt className="h-full w-full text-white" />
            </div>

            {/* Destination pins */}
            {QR_LOCATIONS.map((loc) => (
              <button
                key={loc.key}
                type="button"
                onClick={() => setSelectedKey(loc.key)}
                className={[
                  'group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-500 p-1 shadow-md transition',
                  loc.key === selectedKey ? 'scale-110 ring-2 ring-yellow-300' : '',
                  loc.key === startLocation.key
                    ? 'opacity-0 pointer-events-none'
                    : '',
                ].join(' ')}
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                aria-label={loc.label}
              >
                <FaMapMarkerAlt className="h-5 w-5 text-white" />
                <span className="pointer-events-none absolute left-1/2 top-[-1.8rem] -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] text-white opacity-0 shadow group-hover:opacity-100">
                  {loc.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Destination list / action */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Choose your destination
          </h3>

          <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {QR_LOCATIONS.map((loc) => (
              <button
                key={loc.key}
                type="button"
                onClick={() => setSelectedKey(loc.key)}
                className={[
                  'w-full rounded-2xl border px-3 py-2 text-left text-sm transition',
                  loc.key === selectedKey
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                  loc.key === startLocation.key ? 'opacity-60' : '',
                ].join(' ')}
                disabled={loc.key === startLocation.key}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">
                    {loc.label}
                  </span>
                  {loc.key === selectedKey && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-medium text-white">
                      Selected
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] text-slate-600">
                  {loc.description}
                </p>
                {loc.key === startLocation.key && (
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    This is your current location.
                  </p>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStartRoute}
            disabled={!selectedLocation}
            className={[
              'inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition',
              selectedLocation
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'cursor-not-allowed bg-slate-300 text-slate-600',
            ].join(' ')}
          >
            <FaWalking className="h-4 w-4" />
            {selectedLocation
              ? `Start route to ${selectedLocation.label}`
              : 'Choose a destination to start'}
          </button>
        </section>
      </div>
    </div>
  );
}

function QrMapModal({
  open,
  startKey,
  onClose,
}: {
  open: boolean;
  startKey: QRLocationKey;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-4 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold">Campus 2D Map</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        <QrMapPanel startKey={startKey} />
      </div>
    </div>
  );
}


/* ================= QR alternatives & Scan modal ================= */

function QRAltModal({
  open,
  help,
  onClose,
  onRetry,
}: {
  open: boolean;
  help?: string | null;
  onClose: () => void;
  onRetry: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center gap-3 rounded-t-3xl bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-4 text-white">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
            <FaQrcode className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="text-base font-semibold leading-tight">QR alternatives</h2>
            <p className="text-[12px] text-white/80">Use one of the options below to jump to a room or place</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            ✕
          </button>
        </div>

        <div className="px-5 pt-4">
          {help && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              <FaShieldAlt className="h-3.5 w-3.5" />
              <span>{help}</span>
            </div>
          )}
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            <FaRedo className="h-4 w-4" />
            Try camera again
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ManualCode onDone={onClose} />
            <UploadQr onDone={onClose} />
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-medium">Tips</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                Open the site via <b>https://</b> (or on <code>localhost</code>)
              </li>
              <li>Allow camera permission in your browser settings</li>
              <li>If you have multiple cameras, prefer the “Back/Environment” camera</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanModal({
  open,
  onClose,
  onQrDecoded,
  onUseManual,
}: {
  open: boolean;
  onClose: () => void;
  onQrDecoded?: (payload: string) => boolean | void; // return true if handled
  onUseManual?: () => void; // NEW: switch to link/file modal
}) {

  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const stopVideoStream = () => {
    const el = videoRef.current;
    const media = el?.srcObject as MediaStream | null | undefined;
    if (media) {
      media.getTracks().forEach((t) => t.stop());
      if (el) el.srcObject = null;
    }
  };

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const run = async () => {
      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const backCamId: string | undefined =
          devices.find((d) => /back|rear|environment/i.test(`${d.label}`))
            ?.deviceId ?? devices[0]?.deviceId;

        const controls = await reader.decodeFromVideoDevice(
          backCamId,
          videoRef.current!,
          (result: Result | null | undefined) => {
            if (cancelled || !result) return;
            cancelled = true;

            try {
              controlsRef.current?.stop();
            } catch {}
            stopVideoStream();

            const text = result.getText();

            // 🔸 Let parent handle special QR types first
            let handled = false;
            if (onQrDecoded) {
              handled = !!onQrDecoded(text);
            }

            if (!handled) {
              // default behaviour: URL -> navigate, else go to /maps?code=
              if (/^https?:\/\//i.test(text)) {
                window.location.href = text;
              } else {
                router.push(`/maps?code=${encodeURIComponent(text)}`);
              }
            }

            onClose();
          }
        );

        controlsRef.current = controls;
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : 'Could not access camera. Use HTTPS and allow permission.';
        setError(msg);
      }
    };

    run();

    return () => {
      cancelled = true;
      try {
        controlsRef.current?.stop();
      } catch {}
      stopVideoStream();
      readerRef.current = null;
    };
  }, [open, onClose, onQrDecoded, router]);

   if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Scan a campus QR</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-100">
            ✕
          </button>
        </div>

        {error ? (
          <div className="text-sm text-red-600">
            {error}
            <ul className="mt-2 list-disc pl-5 text-slate-600">
              <li>
                Open the site over <b>https://</b> (or localhost)
              </li>
              <li>Allow camera permission in your browser</li>
              <li>Try switching to your back camera</li>
            </ul>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full rounded-lg bg-black aspect-[3/4]"
              autoPlay
              muted
              playsInline
            />
            <p className="text-xs text-slate-500 mt-2">
              Point your camera at a campus QR code.
            </p>
          </>
        )}

        {/* 🔽 NEW: allow user to switch to link / upload methods */}
        {onUseManual && (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <p className="mb-2">
              Can&apos;t use the camera or prefer another method?
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onUseManual();
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Use link / upload QR image instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= Helpers for “Open now” ================= */

type Hours = { open: string; close: string };
const _mins = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const isOpenNow = (h?: Hours) => {
  if (!h) return undefined;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const a = _mins(h.open),
    b = _mins(h.close);
  return b < a ? cur >= a || cur < b : cur >= a && cur < b;
};

/* ================= Card data & components ================= */

type CardItem = {
  key:
    | 'maps'
    | 'dining'
    | 'study'
    | 'HQ'
    | 'mph'
    | 'studenthub'
    | 'library'
    | 'atrium'
    | 'gblock'; 
  title: string;
  href: string;
  icon: IconType;
  hint: string;
  hours?: Hours;
  stallsCount?: number;
  description?: string;
};

const CARDS: CardItem[] = [
  {
    key: 'maps',
    title: 'Maps',
    href: '/navigate/map',
    icon: FaMapMarkedAlt,
    hint: 'Swinburne Sarawak Map & 360 View',
    description: 'Interactive map with red dots and 360° panoramas.',
  },
  {
    key: 'mph',
    title: 'Multi Purpose Hall',
    href: '/navigate/mph',
    icon: FaBuilding,
    hint: 'Events & assemblies',
    hours: { open: '07:00', close: '23:00' },
    description: 'Venue bookings, exams hall, large events.',
  },
  {
    key: 'atrium',
    title: 'Borneo Atrium',
    href: '/navigate/borneoatrium',
    icon: FaUniversity,
    hint: 'Event Places & Hangout',
    description: 'Main public atrium at between Block A and Block B. Events locate, seating, hangout place.',
  },
  {
    key: 'HQ',
    title: 'Student HQ',
    href: '/navigate/sHQ',
    icon: FaInfoCircle,
    hint: 'Help desk & services',
    hours: { open: '08:00', close: '17:00' },
    description: 'ID cards, enrolment support, fees & forms.',
  },
  {
    key: 'library',
    title: 'Library',
    href: '/navigate/library',
    icon: FaBookOpen,
    hint: 'Resources & study zones',
    hours: { open: '08:00', close: '21:30' },
    description: 'Quiet zone, self-checkout, opening hours.',
  },
  {
    key: 'study',
    title: 'Junction & Study Spaces',
    href: '/navigate/study',
    icon: FaBook,
    hint: 'Study places, group rooms',
    hours: { open: '00:00', close: '24:00' },
    description: 'Junction, charging area, discussion room.',
  },
  {
    key: 'gblock',
    title: 'G Block',
    href: '/navigate/gblock',
    icon: FaLaptopCode ,
    hint: 'Student service & IT Department',
    hours: { open: '08:00', close: '17:00' },
    description: 'Student service desk, IT department offices and support rooms.',
  },
  {
    key: 'studenthub',
    title: 'Student Hub',
    href: '/navigate/shub',
    icon: FaUsers,
    hint: 'Clubs & hangout space',
    hours: { open: '07:00', close: '22:00' },
    description: 'Clubs, lounge areas, activity sign-ups.',
  },
  {
    key: 'dining',
    title: 'Dining',
    href: '/navigate/dining',
    icon: FaUtensils,
    hint: 'Having your breakfast and lunch here',
    hours: { open: '07:00', close: '17:00' },
    stallsCount: 12,
    description: 'Ground floor (chicken rice, noodles)',
  },
];

function TileCard({ card, active }: { card: CardItem; active: boolean }) {
  const open = isOpenNow(card.hours);
  const [expanded, setExpanded] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' && !expanded) {
      e.preventDefault();
      setExpanded(true);
    }
  };

  return (
    <article
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onPointerDown={onPointerDown}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setExpanded(false);
      }}
      className={[
        'group relative overflow-hidden',
        'rounded-[10px] bg-white shadow-[0_6px_12px_rgba(0,0,0,0.05)]',
        'transition-[height,box-shadow] duration-200 ease-in-out',
        'h-35 hover:h-70 focus-within:h-70',
        active ? 'ring-2 ring-[#C8102E]/30' : '',
      ].join(' ')}
    >
      <Link href={card.href} className="flex h-36 flex-col items-start justify-center gap-2 p-4 rounded-[10px] outline-none">
        <div className="inline-flex items-center justify-center rounded-[12px] px-2.5 py-2 bg-[#C8102E]/10">
          <card.icon className="w-5 h-5 text-[#C8102E]" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-slate-900 leading-tight">{card.title}</p>
          <p className="text-[13px] text-slate-600 leading-snug">{card.hint}</p>
        </div>
      </Link>

      <div
        className={[
          'px-4 pb-4 -mt-1 overflow-hidden transition-all duration-200 ease-out',
          expanded ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <div className="rounded-[14px] border border-slate-200 bg-white p-3 text-sm text-slate-700">
          {typeof open === 'boolean' && (
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className={`inline-flex h-2.5 w-2.5 rounded-full ${open ? 'bg-emerald-500' : 'bg-slate-400'}`}
                aria-hidden
              />
              <span className="font-medium">{open ? 'Open now' : 'Closed now'}</span>
              {card.hours && <span className="text-slate-500">({card.hours.open}–{card.hours.close})</span>}
            </div>
          )}
          {typeof card.stallsCount === 'number' && (
            <div className="mb-1.5">
              <span className="font-medium">Stalls:</span> {card.stallsCount}
            </div>
          )}
          {card.description && <div className="line-clamp-3">{card.description}</div>}
        </div>
      </div>
    </article>
  );
}

/* ================= Page ================= */

export default function NavigatePage() {
  const [q, setQ] = useState('');
  const [scanOpen, setScanOpen] = useState(false);
  const [scanHelp, setScanHelp] = useState<string | null>(null);
  const [scanFallbackOpen, setScanFallbackOpen] = useState(false);

  const [qrMapOpen, setQrMapOpen] = useState(false);
  const [qrStartKey, setQrStartKey] = useState<QRLocationKey>('lobby');

  const router = useRouter();

  const onOpenScan = async () => {
    if (!hasCam()) {
      setScanHelp('This device/browser doesn’t support camera access.');
      setScanFallbackOpen(true);
      return;
    }
    const { ok, reason } = await ensurePermission('camera');
    if (!ok) {
      setScanHelp(reason || 'Camera permission denied.');
      setScanFallbackOpen(true);
      return;
    }
    setScanOpen(true);
  };

    const handleQrDecoded = (payload: string) => {
    // 1) Text QR like: "qrmap:lobby"
    if (payload.startsWith('qrmap:')) {
      const key = payload.slice('qrmap:'.length) as QRLocationKey;
      const valid =
        QR_LOCATIONS.find((l) => l.key === key) ?? QR_LOCATIONS[0];
      setQrStartKey(valid.key);
      setQrMapOpen(true);
      return true; // handled -> don't run default behaviour
    }

    // 2) URL QR like: "https://.../navigate/qr-map?start=lobby"
    try {
      if (/^https?:\/\//i.test(payload)) {
        const url = new URL(payload);

        // adjust this path if your route is slightly different
        if (url.pathname.endsWith('/navigate/qr-map')) {
          const startParam = url.searchParams.get('start') as QRLocationKey | null;

          const valid =
            QR_LOCATIONS.find((l) => l.key === startParam) ?? QR_LOCATIONS[0];

          setQrStartKey(valid.key);
          setQrMapOpen(true);
          return true;
        }
      }
    } catch {
    }
    return false;
  };


  const activeKey = useMemo<CardItem['key'] | ''>(() => {
    const t = q.toLowerCase().trim();
    if (!t) return '';
    if (t.includes('g block') || t.includes('gblock') || t.includes('it dept') || t.includes('it department')) return 'gblock';
    if (t.includes('atrium') || t.includes('borneo')) return 'atrium';
    if (t.includes('din') || t.includes('food')) return 'dining';
    if (t.includes('study') || t.includes('room')) return 'study';
    if (t.includes('map') || t.includes('360') || t.includes('route')) return 'maps';
    if (t.includes('library') || t.includes('book')) return 'library';
    if (t.includes('hq') || t.includes('student hq') || t.includes('help') || t.includes('info')) return 'HQ';
    if (t.includes('hall') || t.includes('mph') || t.includes('multi purpose')) return 'mph';
    if (t.includes('hub') || t.includes('student hub') || t.includes('club') || t.includes('hangout')) return 'studenthub';
    return '';
  }, [q]);

  return (
    <SubpageLayout icon="" title="" description="">

    <div className="col-span-full">
      <header className="flex items-center gap-3 p-3 -mt-12 bg-white border-2 border-red-700 rounded-2xl shadow-md shadow-red-200">
        <Link
          href="/"
          aria-label="Back"
          className="grid place-items-center w-10 h-10 border border-slate-300 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition"
        >
          ←
        </Link>

        <span className="grid place-items-center w-12 h-12 rounded-xl text-3xl leading-none">
          🧭
        </span>


        <div>
          <h1 className="text-lg font-extrabold text-slate-900">Campus Navigation</h1>
          <p className="text-sm text-slate-500 mt-0.5">Find places and services across campus</p>
        </div>
      </header>
    </div>

      <div className="col-span-full">
        <SearchBar
          onSearch={setQ}
          onSubmit={() => {
            if (activeKey) {
              const target = CARDS.find((c) => c.key === activeKey);
              if (target) router.push(target.href);
            }
          }}
          onScan={onOpenScan}
          className="mb-1 md:mb-1"
        />
      </div>

      <div className="col-span-full grid grid-cols-2 md:grid-cols-3 gap-3">
        {CARDS.map((c) => (
          <TileCard key={c.key} card={c} active={c.key === activeKey} />
        ))}
      </div>

      <ScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onQrDecoded={handleQrDecoded}
        onUseManual={() => {
          // close camera modal and open the alternatives modal
          setScanOpen(false);
          setScanFallbackOpen(true);
          // optional: no error message when user chooses it manually
          if (!scanHelp) setScanHelp(null);
        }}
      />

      <QRAltModal
        open={scanFallbackOpen}
        help={scanHelp}
        onClose={() => setScanFallbackOpen(false)}
        onRetry={async () => {
          setScanFallbackOpen(false);
          await onOpenScan();
        }}
      />

      <QrMapModal
        open={qrMapOpen}
        startKey={qrStartKey}
        onClose={() => setQrMapOpen(false)}
      />
    </SubpageLayout>
  );
}