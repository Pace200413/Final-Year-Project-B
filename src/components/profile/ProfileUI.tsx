"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  LifeBuoy,
  PencilLine,
  Settings,
  Shield,
  User,
} from "lucide-react";

export type ProfileViewModel = {
  fullName: string;
  email: string;
  studentId: string;
  faculty: string;
  course: string;
  yearLabel: string;
  campus: string;
  roleLabel: string;
  microsoftConnected: boolean;
  isAdmin: boolean;
  unauthorized?: boolean;
};

const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 sm:px-6";

const MICROSOFT_URL =
  "https://login.microsoftonline.com/3f639a9b-27c8-4403-82b1-ebfb88052d15/wsfed?wa=wsignin1.0&wtrealm=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&wctx=rm%3d0%26id%3dpassive%26ru%3dsecure%2fstudent%2fstuportal.aspx&wreply=https%3a%2f%2fsisportal-100380.campusnexus.cloud%2fCMCPortal%2f&AppType=Portal&Role=STUDENT";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function displayValue(value?: string, fallback = "Not provided") {
  const clean = value?.trim();
  return clean ? clean : fallback;
}

function initialsFromName(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-slate-100 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-[12px] font-medium text-slate-500">{label}</span>
      <span className="max-w-[65%] text-right text-[13px] font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}

function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,.06)]">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-900 text-white shadow-sm">
          {icon}
        </span>

        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-[12.5px] leading-snug text-slate-600">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
}

function ProfileHero({ profile }: { profile: ProfileViewModel }) {
  const initials = initialsFromName(profile.fullName);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,.08)]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,42,48,.12),transparent_36%),linear-gradient(180deg,#fff,#fff7f7_60%,#ffffff)]"
      />
      <div
        aria-hidden
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#D42A30]/10 blur-3xl"
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-100">
            <span
              className={cx(
                "h-2 w-2 rounded-full",
                profile.microsoftConnected ? "bg-emerald-500" : "bg-amber-500"
              )}
              aria-hidden
            />
            Profile
          </div>

          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Edit profile
            <PencilLine className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-sm">
            {initials}
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-[24px] font-semibold tracking-tight text-slate-900 sm:text-[28px]">
              {profile.fullName}
            </h1>

            <p className="mt-1 text-[13.5px] text-slate-600">
              {profile.email
                ? profile.email
                : "Connect your Swinburne Microsoft account to sync your profile."}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-700 ring-1 ring-slate-200">
                {profile.roleLabel}
              </span>

              <span
                className={cx(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium ring-1",
                  profile.microsoftConnected
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-amber-50 text-amber-700 ring-amber-200"
                )}
              >
                {profile.microsoftConnected ? "Connected" : "Not connected"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-[680px] sm:grid-cols-4">
          <InfoTile label="Student ID" value={displayValue(profile.studentId)} />
          <InfoTile label="Academic school" value={displayValue(profile.faculty)} />
          <InfoTile label="Year / Status" value={displayValue(profile.yearLabel)} />
          <InfoTile label="Campus" value={displayValue(profile.campus)} />
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-[14px] font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export function ProfileUI({ profile }: { profile: ProfileViewModel }) {
  return (
    <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+84px)]">
      <div className={CONTAINER}>
        {profile.unauthorized ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">Admin access required</div>
                <div className="mt-0.5 text-amber-800/90">
                  You were redirected because this account does not have admin permission.
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <ProfileHero profile={profile} />
      </div>

      <section className={`${CONTAINER} mt-6`}>
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            title="Student details"
            subtitle="Your saved academic and campus information."
            icon={<User className="h-5 w-5" />}
          >
            <div className="space-y-1">
              <DetailRow label="Full name" value={displayValue(profile.fullName)} />
              <DetailRow label="Student ID" value={displayValue(profile.studentId)} />
              <DetailRow label="Academic school" value={displayValue(profile.faculty)} />
              <DetailRow label="Course" value={displayValue(profile.course)} />
              <DetailRow label="Year / Status" value={displayValue(profile.yearLabel)} />
              <DetailRow label="Campus" value={displayValue(profile.campus)} />
            </div>

            <div className="mt-4">
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-[13px] font-semibold text-white hover:opacity-95"
              >
                Update details
                <PencilLine className="h-4 w-4" />
              </Link>
            </div>
          </Card>

          <div className="grid gap-4">
            <Card
              title="Account"
              subtitle="Connection and profile actions."
              icon={<Shield className="h-5 w-5" />}
            >
              <div
                className={cx(
                  "rounded-2xl border px-4 py-3",
                  profile.microsoftConnected
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                )}
              >
                <div className="flex items-start gap-2">
                  {profile.microsoftConnected ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  )}

                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">
                      {profile.microsoftConnected
                        ? "Microsoft account connected"
                        : "Microsoft account not connected"}
                    </div>
                    <div className="mt-1 text-[12.5px] text-slate-700">
                      {profile.microsoftConnected
                        ? displayValue(profile.email)
                        : "Use Microsoft sign-in to sync your campus profile."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={MICROSOFT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-[13px] font-semibold text-white hover:opacity-95"
                >
                  {profile.microsoftConnected ? "Manage account" : "Connect Microsoft"}
                  <ExternalLink className="h-4 w-4" />
                </a>

                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Settings
                  <Settings className="h-4 w-4" />
                </Link>
              </div>
            </Card>

            <Card
              title="Help"
              subtitle="Profile-related support only."
              icon={<LifeBuoy className="h-5 w-5" />}
            >
              <div className="space-y-1">
                <DetailRow label="Support" value="Campus support and account help" />
                <DetailRow label="Study status" value={displayValue(profile.yearLabel, "Current student")} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/support"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-[13px] font-semibold text-white hover:opacity-95"
                >
                  Open support
                </Link>

                {profile.isAdmin ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Admin console
                  </Link>
                ) : null}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className={`${CONTAINER} mt-4 mb-8`}>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-900 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>

            <div>
              <div className="text-[14px] font-semibold text-slate-900">
                Keep your details up to date
              </div>
              <div className="mt-1 text-[12.5px] text-slate-600">
                Your profile helps keep academic and support information relevant to your account.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}