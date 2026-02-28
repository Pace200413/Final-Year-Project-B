import Link from "next/link";

export default function MenuPage() {
  const items = [
    { name: "Orientation", href: "/orientation" },
    { name: "Events", href: "/events" },
    { name: "Emergency", href: "/emergency" },
    { name: "Support", href: "/support" }
  ];
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Menu</h1>
      <ul className="mt-4 space-y-3">
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              className="block rounded-xl border p-3 bg-white hover:border-[#D42A30] hover:text-[#D42A30]"
            >
              {i.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
