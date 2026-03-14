import {
  ArrowUpRight,
  Brain,
  Clock3,
  Flame,
  Gamepad2,
  Sparkles,
  Trophy,
} from "lucide-react";

type GameItem = {
  name: string;
  description: string;
  href: string;
  meta: string;
  cue: string;
  featured?: boolean;
  badge?: string;
};

type GameSection = {
  title: string;
  subtitle: string;
  games: GameItem[];
};

export default function StudyBreakPage() {
  const topFive: GameItem[] = [
  {
    name: "Lichess",
    description: "Clean browser chess with no ads and instant play.",
    href: "https://lichess.org/",
    meta: "Top pick",
    cue: "Ad-free strategy",
    featured: true,
    badge: "Top 5",
  },
  {
    name: "TETR.IO",
    description: "Fast modern browser stacker with a clean, competitive feel.",
    href: "https://tetr.io/",
    meta: "Top pick",
    cue: "Fast arcade",
    featured: true,
    badge: "Top 5",
  },
  {
    name: "Tetris",
    description: "Official browser Tetris for quick classic gameplay.",
    href: "https://play.tetris.com/",
    meta: "Top pick",
    cue: "Official classic",
    featured: true,
    badge: "Top 5",
  },
  {
    name: "Skribbl.io",
    description: "Simple browser drawing-and-guessing game that works well with friends.",
    href: "https://skribbl.io/",
    meta: "Top pick",
    cue: "Party game",
    featured: true,
    badge: "Top 5",
  },
  {
    name: "Pokémon Showdown",
    description: "Instant browser battles with strong competitive depth.",
    href: "https://pokemonshowdown.com/",
    meta: "Top pick",
    cue: "Battle strategy",
    featured: true,
    badge: "Top 5",
  },
];

  const sections: GameSection[] = [
  {
    title: "Quick reset picks",
    subtitle: "Fast, browser-friendly games for short breaks between classes.",
    games: [
      {
        name: "2048",
        description: "Quick number puzzle for a short mental reset.",
        href: "https://play2048.co/",
        meta: "2–5 min",
        cue: "Brain warm-up",
      },
      {
        name: "Wordle",
        description: "A short daily word challenge with a very clean format.",
        href: "https://www.nytimes.com/games/wordle/index.html",
        meta: "Daily",
        cue: "Word game",
      },
      {
        name: "Sudoku",
        description: "Calm logic practice when you want something focused and quiet.",
        href: "https://sudoku.com/",
        meta: "Focus",
        cue: "Quiet logic",
      },
      {
        name: "TETR.IO",
        description: "Fast browser stacker if you want something more competitive.",
        href: "https://tetr.io/",
        meta: "Arcade",
        cue: "Fast reflexes",
      },
      {
        name: "Skribbl.io",
        description: "Easy multiplayer drawing and guessing game in the browser.",
        href: "https://skribbl.io/",
        meta: "Party",
        cue: "Play with friends",
      },
      {
        name: "Lichess",
        description: "Clean browser chess with quick games and puzzles.",
        href: "https://lichess.org/",
        meta: "Strategy",
        cue: "No ads",
      },
    ],
  },
];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
 <section className="relative overflow-hidden rounded-[26px] border border-white/70 bg-white/92 p-4 shadow-[0_14px_36px_rgba(15,23,42,.07)] ring-1 ring-slate-200/80 sm:p-5">
  <div
    aria-hidden
    className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,42,48,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_22%)]"
  />

  <div className="relative">
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D42A30]/10 px-2.5 py-1 text-[11px] font-semibold text-[#D42A30] ring-1 ring-[#D42A30]/10">
        <Sparkles className="h-3.5 w-3.5" />
        Study Break
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 shadow-sm">
        <Clock3 className="h-3.5 w-3.5" />
        Browser games
      </div>

      <div className="inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-[10.5px] font-medium text-slate-500 ring-1 ring-slate-200 shadow-sm">
        11 picks
      </div>
    </div>

    <h1 className="mt-3 text-[2rem] font-semibold tracking-tight text-slate-900 sm:text-[2.15rem]">
      Take a short reset
    </h1>

    <p className="mt-2 max-w-xl text-[14px] leading-7 text-slate-600 sm:text-[15px]">
      Quick browser games for a short reset between classes.
    </p>

    <div className="mt-4 flex flex-wrap items-center gap-2.5">
      <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm">
        <Brain className="h-4 w-4 text-[#D42A30]" />
        Short mental reset
      </div>

      <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm">
        <Gamepad2 className="h-4 w-4 text-sky-600" />
        No download needed
      </div>

      <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm">
        <Flame className="h-4 w-4 text-amber-600" />
        Top 5 included
      </div>
    </div>
  </div>
</section>

      <section className="space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
            <Trophy className="h-3.5 w-3.5" />
            Top 5 browser games
          </div>

          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            Most recognizable browser picks
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Better-known titles if you want the strongest starting lineup.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topFive.map((game, index) => (
            <GameCard key={game.name} game={game} priorityLabel={`#${index + 1}`} large />
          ))}
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{section.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {section.games.map((game) => (
              <GameCard key={game.name} game={game} />
            ))}
          </div>
        </section>
      ))}

      <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_14px_32px_rgba(15,23,42,.05)] ring-1 ring-slate-200/80">
        <div
          aria-hidden
          className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#D42A30]/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Quick tip</div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Best for short breaks, not long sessions. Everything opens in the browser.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
            <Gamepad2 className="h-4 w-4" />
            Browser-only
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoChip({
  icon: Icon,
  text,
  color,
}: {
  icon: typeof Brain;
  text: string;
  color: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm">
      <Icon className={`h-4 w-4 ${color}`} />
      {text}
    </div>
  );
}

function GameCard({
  game,
  large = false,
  priorityLabel,
}: {
  game: GameItem;
  large?: boolean;
  priorityLabel?: string;
}) {
  return (
    <a
      href={game.href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/70 bg-white/92",
        "shadow-[0_14px_34px_rgba(15,23,42,.06)] ring-1 ring-slate-200/80",
        "transition duration-300 hover:-translate-y-[2px] hover:shadow-[0_22px_44px_rgba(15,23,42,.10)]",
        large ? "p-5 sm:p-6" : "p-5",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-200/40 blur-3xl transition duration-500 group-hover:scale-125"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <GameLogo name={game.name} href={game.href} />
          {priorityLabel ? (
            <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
              {priorityLabel}
            </span>
          ) : null}
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-[10.5px] font-medium text-slate-500 ring-1 ring-slate-200 shadow-sm">
          <ArrowUpRight className="h-[10px] w-[10px] opacity-75" />
          Browser
        </div>
      </div>

      <div className="relative mt-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-centersafe gap-2">
              <h3 className={large ? "text-[1.35rem] font-semibold tracking-tight text-slate-900" : "text-xl font-semibold tracking-tight text-slate-900"}>
                {game.name}
              </h3>

              {game.badge ? (
                <span className="inline-flex items-center rounded-full bg-[#D42A30]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D42A30] ring-1 ring-[#D42A30]/10">
                  {game.badge}
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">{game.description}</p>
          </div>

          <span className="mt-1 text-slate-300/80 transition group-hover:text-[#D42A30]/85">
            <ArrowUpRight className="h-[12px] w-[12px]" />
          </span>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
            {game.meta}
          </span>

          <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
            {game.cue}
          </span>
        </div>

        <span className="text-sm font-semibold text-slate-500 transition group-hover:text-[#D42A30]">
          Play now
        </span>
      </div>
    </a>
  );
}

function GameLogo({ name, href }: { name: string; href: string }) {
  const src = `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(href)}`;

  return (
    <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <img
        src={src}
        alt={`${name} logo`}
        className="h-7 w-7 rounded-md object-contain"
        loading="lazy"
      />
    </div>
  );
}