// src/app/book-a-room/page.tsx
import Link from "next/link";

const SKEDDA_URL = "https://myvenuehub.skedda.com/";

const steps = [
  "Log in to myvenuehub.skedda.com.",
  "In the location drop down list, select Library discussion rooms.",
  "Choose the room you want to book (green colour indicates that the room is available).",
  "Click any of the available time slots.",
  "Set the date & time (maximum is 2 hours per booking).",
  "Under Attendee Counts, key in total users.",
  "Under I acknowledge that this booking request is unconfirmed, click Unconfirmed.",
  "Click I have read the conditions of use and understood them.",
  "Click Confirm Booking.",
];

const conditions = [
  "Minimum 3 users.",
  "Users who did not check-in via SKEDDA or left room unattended for 15 minutes would have their booking terminated.",
  "Please keep the noise level in the discussion rooms at a reasonable level. Rooms are not soundproof.",
  "Keep it neat and orderly.",
  "No moving furniture into or out of the discussion rooms.",
  "Do not leave your belongings unattended.",
  "Any personal injury, damage or loss of user’s personal belongings should not be the responsibility of the library.",
  "Offenders will be asked to leave the library.",
  "Swinburne Sarawak Library shall not be responsible for any personal injury, damage, or loss of personal items of library users.",
];

export default function BookARoomPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,.08)] sm:p-8">
        <div className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100">
          Library
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Discussion Room Booking
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          Use the library booking system to reserve a discussion room. Read the steps and conditions
          carefully before confirming your booking.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={SKEDDA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            Open booking system
          </a>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back to home
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Booking steps</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 ring-1 ring-slate-200">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Conditions of use</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              {conditions.map((condition) => (
                <li key={condition} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-400" />
                  <span>{condition}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}