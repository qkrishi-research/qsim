import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { moduleCategories, modules } from "@/modules/registry";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 264;

export function Sidebar() {
  const open = useWorkspaceStore((s) => s.sidebarOpen);
  const compact = useWorkspaceStore((s) => s.compact);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={compact ? { x: -SIDEBAR_WIDTH } : { width: 0, opacity: 0 }}
          animate={compact ? { x: 0 } : { width: SIDEBAR_WIDTH, opacity: 1 }}
          exit={compact ? { x: -SIDEBAR_WIDTH } : { width: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "shrink-0 overflow-hidden border-r border-line bg-surface",
            compact
              ? "absolute inset-y-0 left-0 z-30 shadow-float"
              : "relative z-10"
          )}
        >
          <div
            className="flex h-full flex-col"
            style={{ width: SIDEBAR_WIDTH }}
          >
            <div className="px-3 pb-2 pt-3">
              <label className="group flex items-center gap-2 rounded-md border border-line bg-panel px-2.5 py-2 transition-colors focus-within:border-accent/50 focus-within:bg-surface">
                <Search
                  className="h-3.5 w-3.5 text-ink-faint"
                  strokeWidth={2}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search modules"
                  className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
                />
              </label>
            </div>

            <ScrollArea className="flex-1">
              <nav className="px-2 pb-4">
                {moduleCategories.map((category) => {
                  const items = filtered.filter(
                    (m) => m.category === category.id
                  );
                  if (items.length === 0) return null;

                  return (
                    <section key={category.id} className="mb-1 mt-3 first:mt-1">
                      <div className="px-2 pb-1.5">
                        <span className="label-caps">{category.label}</span>
                      </div>
                      <ul className="flex flex-col gap-0.5">
                        {items.map((m) => (
                          <li key={m.id}>
                            <ModuleLink module={m} />
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}

                {filtered.length === 0 && (
                  <p className="px-3 py-8 text-center text-xs text-ink-faint">
                    No modules match "{query}".
                  </p>
                )}
              </nav>
            </ScrollArea>

            <div className="border-t border-line px-4 py-3">
              <p className="text-2xs leading-relaxed text-ink-faint">
                Select a module to load it onto the stage. Interact, run, and
                observe.
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function ModuleLink({
  module,
}: {
  module: (typeof modules)[number];
}) {
  const Icon = module.icon;
  const disabled = module.status === "planned";
  const compact = useWorkspaceStore((s) => s.compact);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);

  const content = (active: boolean) => (
    <div
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors",
        disabled
          ? "cursor-default text-ink-faint"
          : active
            ? "bg-accent-soft text-accent"
            : "text-ink-muted hover:bg-panel hover:text-ink"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active && !disabled ? "text-accent" : "text-ink-subtle"
        )}
        strokeWidth={1.75}
      />
      <span className="truncate font-medium">{module.title}</span>
      {disabled && (
        <Lock className="ml-auto h-3 w-3 text-ink-faint" strokeWidth={2} />
      )}
    </div>
  );

  if (disabled) {
    return (
      <div title="Available in an upcoming phase" aria-disabled>
        {content(false)}
      </div>
    );
  }

  return (
    <NavLink
      to={`/module/${module.id}`}
      onClick={() => {
        if (compact) toggleSidebar();
      }}
    >
      {({ isActive }) => content(isActive)}
    </NavLink>
  );
}
