// src/app/timetable/page.tsx
import Link from "next/link";
import { auth, signIn } from "@/auth";

const TIMETABLE_URL =
  "https://sisportal-100380.campusnexus.cloud/CMCPortal/secure/links/Student111.aspx?sm=10";

export default async function TimetablePage() {
  const session = await auth();
  const signedIn = Boolean(session?.user);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,.08)]">
        <div className="h-2 w-full bg-[#7fbf00]" />

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#7fbf00] text-white shadow-sm">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.02-8 4.5V20h16v-1.5C20 16.02 16.42 14 12 14Z" />
              </svg>
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Student timetable
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Access your timetable through the Swinburne Student Portal. Sign in with your
                Microsoft account first, then open the portal timetable page.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">
              {signedIn
                ? `Signed in as ${session?.user?.name || session?.user?.email || "Swinburne user"}`
                : "You are not signed in yet."}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {signedIn
                ? "You can now continue to the Student Portal timetable page."
                : "Use your Swinburne Microsoft account to continue."}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {signedIn ? (
              <a
                href={TIMETABLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                Open timetable in Student Portal
              </a>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("microsoft-entra-id", { redirectTo: "/timetable" });
                }}
              >
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 sm:w-auto"
                >
                  Sign in with Microsoft
                </button>
              </form>
            )}

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Back to home
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-900">What you can access</h2>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li>Timetable</li>
                <li>Registration details</li>
                <li>Fees and account information</li>
                <li>Other student records</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-900">Why this page exists</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This gives students one clean place inside the app before sending them to the
                official Student Portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}