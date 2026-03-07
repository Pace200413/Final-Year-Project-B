import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use your Swinburne Microsoft account to continue.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("microsoft-entra-id", { redirectTo: "/profile" });
          }}
          className="mt-6"
        >
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Sign in with Microsoft
          </button>
        </form>
      </div>
    </div>
  );
}