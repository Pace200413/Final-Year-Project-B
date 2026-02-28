export default function OrientationPage() {
  const steps = [
    "Activate your student account",
    "Check your timetable",
    "Get your ID card",
    "Join student clubs",
    "Learn campus safety",
    "Explore library services",
    "Download the campus app"
  ];
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Orientation</h1>
      <ol className="mt-4 space-y-2 list-decimal list-inside">
        {steps.map(s => <li key={s}>{s}</li>)}
      </ol>
    </div>
  );
}
