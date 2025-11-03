"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  ListChecks,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Users2,
  WandSparkles,
} from "lucide-react";

type TaskStatus = "backlog" | "in-progress" | "review" | "done";
type TaskPriority = "low" | "medium" | "high" | "critical";
type AccentTone = "emerald" | "violet" | "amber" | "sky" | "rose" | "cyan";

export interface Task {
  id: string;
  title: string;
  summary?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkGroup {
  id: string;
  name: string;
  tagline: string;
  accent: AccentTone;
  tasks: Task[];
}

interface TaskDashboardProps {
  initialGroups: WorkGroup[];
}

const STORAGE_KEY = "aster-task-flow:v1";
const STATUS_SEQUENCE: TaskStatus[] = [
  "backlog",
  "in-progress",
  "review",
  "done",
];

const STATUS_META: Record<
  TaskStatus,
  { label: string; chip: string; glow: string }
> = {
  backlog: {
    label: "Backlog",
    chip: "bg-slate-500/15 text-slate-100 border border-white/5",
    glow: "from-slate-500/40 via-slate-500/10 to-slate-900/40",
  },
  "in-progress": {
    label: "In Progress",
    chip: "bg-sky-500/20 text-sky-100 border border-sky-400/40",
    glow: "from-sky-500/50 via-sky-500/10 to-slate-900/40",
  },
  review: {
    label: "Review",
    chip: "bg-amber-400/20 text-amber-100 border border-amber-400/40",
    glow: "from-amber-500/40 via-amber-400/10 to-slate-900/40",
  },
  done: {
    label: "Completed",
    chip: "bg-emerald-500/20 text-emerald-100 border border-emerald-500/40",
    glow: "from-emerald-500/40 via-emerald-500/10 to-slate-900/40",
  },
};

const PRIORITY_META: Record<
  TaskPriority,
  { label: string; chip: string; ring: string }
> = {
  low: {
    label: "Low impact",
    chip: "bg-slate-500/20 text-slate-100",
    ring: "ring-slate-400/40",
  },
  medium: {
    label: "Medium",
    chip: "bg-indigo-500/20 text-indigo-100",
    ring: "ring-indigo-400/40",
  },
  high: {
    label: "High",
    chip: "bg-amber-500/20 text-amber-100",
    ring: "ring-amber-400/40",
  },
  critical: {
    label: "Critical",
    chip: "bg-rose-500/25 text-rose-100",
    ring: "ring-rose-400/40",
  },
};

const ACCENT_THEMES: Record<
  AccentTone,
  {
    gradient: string;
    glow: string;
    button: string;
    chip: string;
    softText: string;
  }
> = {
  emerald: {
    gradient: "from-emerald-500/70 via-emerald-400/25 to-emerald-500/10",
    glow: "shadow-[0_25px_80px_-25px_rgba(16,185,129,0.75)]",
    button:
      "focus-visible:ring-emerald-400/60 hover:bg-emerald-500/15 text-emerald-100/90",
    chip: "bg-emerald-500/20 text-emerald-100",
    softText: "text-emerald-100/80",
  },
  violet: {
    gradient: "from-violet-500/70 via-violet-400/25 to-violet-500/10",
    glow: "shadow-[0_25px_80px_-25px_rgba(139,92,246,0.75)]",
    button:
      "focus-visible:ring-violet-400/60 hover:bg-violet-500/15 text-violet-100/90",
    chip: "bg-violet-500/20 text-violet-100",
    softText: "text-violet-100/80",
  },
  amber: {
    gradient: "from-amber-500/70 via-amber-400/25 to-amber-500/10",
    glow: "shadow-[0_25px_80px_-25px_rgba(245,158,11,0.75)]",
    button:
      "focus-visible:ring-amber-400/60 hover:bg-amber-500/15 text-amber-100/90",
    chip: "bg-amber-500/20 text-amber-100",
    softText: "text-amber-100/80",
  },
  sky: {
    gradient: "from-sky-500/70 via-sky-400/25 to-sky-500/10",
    glow: "shadow-[0_25px_80px_-25px_rgba(14,165,233,0.75)]",
    button:
      "focus-visible:ring-sky-400/60 hover:bg-sky-500/15 text-sky-100/90",
    chip: "bg-sky-500/20 text-sky-100",
    softText: "text-sky-100/80",
  },
  rose: {
    gradient: "from-rose-500/70 via-rose-400/25 to-rose-500/10",
    glow: "shadow-[0_25px_80px_-25px_rgba(244,63,94,0.75)]",
    button:
      "focus-visible:ring-rose-400/60 hover:bg-rose-500/15 text-rose-100/90",
    chip: "bg-rose-500/20 text-rose-100",
    softText: "text-rose-100/80",
  },
  cyan: {
    gradient: "from-cyan-500/70 via-cyan-400/25 to-cyan-500/10",
    glow: "shadow-[0_25px_80px_-25px_rgba(6,182,212,0.75)]",
    button:
      "focus-visible:ring-cyan-400/60 hover:bg-cyan-500/15 text-cyan-100/90",
    chip: "bg-cyan-500/20 text-cyan-100",
    softText: "text-cyan-100/80",
  },
};

const ACCENT_SEQUENCE: AccentTone[] = [
  "emerald",
  "violet",
  "amber",
  "sky",
  "rose",
  "cyan",
];

type TaskFormState = {
  title: string;
  summary: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string;
  owner: string;
  groupId: string;
};

type GroupFormState = {
  name: string;
  tagline: string;
};

export function TaskDashboard({ initialGroups }: TaskDashboardProps) {
  const [hydrated, setHydrated] = useState(false);
  const [groups, setGroups] = useState<WorkGroup[]>(initialGroups);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialGroups[0]?.id ?? "",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [focusMode, setFocusMode] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);

  const [taskForm, setTaskForm] = useState<TaskFormState>(() => ({
    title: "",
    summary: "",
    dueDate: "",
    priority: "medium",
    status: "backlog",
    tags: "",
    owner: "",
    groupId: initialGroups[0]?.id ?? "",
  }));

  const [groupForm, setGroupForm] = useState<GroupFormState>({
    name: "",
    tagline: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: WorkGroup[] = JSON.parse(stored);
        setGroups(parsed);
        if (!parsed.find((group) => group.id === selectedGroupId)) {
          setSelectedGroupId(parsed[0]?.id ?? "");
        }
      }
    } catch (error) {
      console.warn("[TaskDashboard] Failed to restore state", error);
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }, [groups, hydrated]);

  const selectedGroup = useMemo(() => {
    if (!groups.length) return undefined;
    return (
      groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? undefined
    );
  }, [groups, selectedGroupId]);

  const visibleTasks = useMemo(() => {
    if (!selectedGroup) return [];
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return selectedGroup.tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }
      if (normalizedSearch.length) {
        const haystack = [
          task.title,
          task.summary ?? "",
          task.owner ?? "",
          task.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(normalizedSearch)) {
          return false;
        }
      }
      if (focusMode && !isFocusCandidate(task)) {
        return false;
      }
      return true;
    });
  }, [selectedGroup, searchTerm, statusFilter, focusMode]);

  const statusBuckets = useMemo(() => {
    return STATUS_SEQUENCE.reduce<Record<TaskStatus, Task[]>>(
      (accumulator, status) => {
        accumulator[status] = visibleTasks.filter(
          (task) => task.status === status,
        );
        return accumulator;
      },
      {
        backlog: [],
        "in-progress": [],
        review: [],
        done: [],
      },
    );
  }, [visibleTasks]);

  const overview = useMemo(() => {
    if (!selectedGroup) {
      return {
        total: 0,
        inProgress: 0,
        completed: 0,
        dueSoon: 0,
      };
    }
    const now = new Date();
    const midnightNow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const total = selectedGroup.tasks.length;
    const inProgress = selectedGroup.tasks.filter(
      (task) => task.status === "in-progress",
    ).length;
    const completed = selectedGroup.tasks.filter(
      (task) => task.status === "done",
    ).length;
    const dueSoon = selectedGroup.tasks.filter((task) => {
      if (!task.dueDate) return false;
      const due = parseDate(task.dueDate);
      if (!due) return false;
      const diffDays =
        (due.getTime() - midnightNow.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 3 && task.status !== "done";
    }).length;
    return {
      total,
      inProgress,
      completed,
      dueSoon,
    };
  }, [selectedGroup]);

  const accentForGroup = (group?: WorkGroup) =>
    group ? ACCENT_THEMES[group.accent] : ACCENT_THEMES.emerald;

  const handleTaskFormChange =
    (field: keyof TaskFormState) =>
    (value: string): void => {
      setTaskForm((state) => ({
        ...state,
        [field]: value,
      }));
    };

  const handleGroupFormChange =
    (field: keyof GroupFormState) => (value: string) => {
      setGroupForm((state) => ({
        ...state,
        [field]: value,
      }));
    };

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      summary: "",
      dueDate: "",
      priority: "medium",
      status: "backlog",
      tags: "",
      owner: "",
      groupId: selectedGroup?.id ?? initialGroups[0]?.id ?? "",
    });
  };

  const resetGroupForm = () => {
    setGroupForm({
      name: "",
      tagline: "",
    });
  };

  const submitTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = taskForm.title.trim();
    if (!title) return;
    const groupId =
      taskForm.groupId || selectedGroup?.id || initialGroups[0]?.id;
    if (!groupId) return;
    const nextGroups = groups.map((group) => {
      if (group.id !== groupId) return group;
      const now = new Date().toISOString();
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        summary: taskForm.summary.trim() || undefined,
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || undefined,
        tags: parseTags(taskForm.tags),
        owner: taskForm.owner.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...group,
        tasks: [newTask, ...group.tasks],
      };
    });
    setGroups(nextGroups);
    setTaskModalOpen(false);
    resetTaskForm();
  };

  const submitGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = groupForm.name.trim();
    if (!name) return;
    const tagline = groupForm.tagline.trim() || "Fresh initiative";
    const accent = ACCENT_SEQUENCE[groups.length % ACCENT_SEQUENCE.length];
    const newGroup: WorkGroup = {
      id: crypto.randomUUID(),
      name,
      tagline,
      accent,
      tasks: [],
    };
    setGroups((current) => [...current, newGroup]);
    setSelectedGroupId(newGroup.id);
    setGroupModalOpen(false);
    resetGroupForm();
    resetTaskForm();
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setGroups((current) =>
      current.map((group) => {
        if (!selectedGroup || group.id !== selectedGroup.id) return group;
        return {
          ...group,
          tasks: group.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status, updatedAt: new Date().toISOString() }
              : task,
          ),
        };
      }),
    );
  };

  const toggleCompletion = (taskId: string) => {
    if (!selectedGroup) return;
    const task = selectedGroup.tasks.find((item) => item.id === taskId);
    if (!task) return;
    updateTaskStatus(taskId, task.status === "done" ? "in-progress" : "done");
  };

  const deleteTask = (taskId: string) => {
    if (!selectedGroup) return;
    setGroups((current) =>
      current.map((group) => {
        if (group.id !== selectedGroup.id) return group;
        return {
          ...group,
          tasks: group.tasks.filter((task) => task.id !== taskId),
        };
      }),
    );
  };

  const statusesToRender =
    statusFilter === "all" ? STATUS_SEQUENCE : [statusFilter];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <BackgroundAurora />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-16 sm:px-8 lg:px-10">
        <header className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/[0.03] px-8 pt-10 pb-8 shadow-[0_40px_120px_-40px_rgba(56,189,248,0.5)] backdrop-blur-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-violet-500/10 to-transparent" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 text-balance">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sky-100/70">
                <Sparkles size={14} /> Agentic Workflows
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Aster Task Flow
                </h1>
                <p className="mt-3 max-w-2xl text-lg text-slate-200/80">
                  Curate Party A, Party B, and more in a minimal, glowing HQ.
                  Group insights, status rituals, and due date intelligence keep
                  momentum visible.
                </p>
              </div>
              {selectedGroup ? (
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300/80">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays size={16} className="text-slate-300/70" />
                    <span>{formatFullDate(new Date())}</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Users2 size={16} className="text-slate-300/70" />
                    <span>
                      {selectedGroup.name} · {selectedGroup.tagline}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-200/90">
              <button
                type="button"
                onClick={() => {
                  resetTaskForm();
                  setTaskForm((state) => ({
                    ...state,
                    groupId: selectedGroup?.id ?? initialGroups[0]?.id ?? "",
                  }));
                  setTaskModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2.5 font-medium text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
              >
                <Plus size={16} /> Add task
              </button>
              <button
                type="button"
                onClick={() => setGroupModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 font-medium text-slate-100 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60"
              >
                <WandSparkles size={16} /> New party
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            icon={<ListChecks size={18} />}
            title="Total scope"
            value={overview.total}
            tone="text-white"
          />
          <InsightCard
            icon={<Clock3 size={18} />}
            title="In progress"
            value={overview.inProgress}
            caption="Flying toward done"
            tone="text-sky-200"
          />
          <InsightCard
            icon={<CheckCircle2 size={18} />}
            title="Completed"
            value={overview.completed}
            caption="Closed loops"
            tone="text-emerald-200"
          />
          <InsightCard
            icon={<CalendarDays size={18} />}
            title="Due soon"
            value={overview.dueSoon}
            caption="Next 3 days"
            tone="text-amber-200"
          />
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm font-medium uppercase tracking-[0.35em] text-slate-200/60">
              Parties
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => {
              const accent = accentForGroup(group);
              const active = selectedGroup?.id === group.id;
              const pending = group.tasks.filter(
                (task) => task.status !== "done",
              ).length;
              const completed = group.tasks.filter(
                (task) => task.status === "done",
              ).length;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`relative overflow-hidden rounded-4xl border px-6 pb-6 pt-7 text-left transition ${
                    active
                      ? "border-white/40 bg-white/12"
                      : "border-white/10 bg-white/[0.05] hover:border-white/20 hover:bg-white/10"
                  } ${accent.glow} focus-visible:outline-none focus-visible:ring-2 ${accent.button}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent.gradient}`}
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-[0.28em] text-white/60">
                          {group.name}
                        </span>
                      </div>
                      <p className={`max-w-sm text-sm ${accent.softText}`}>
                        {group.tagline}
                      </p>
                    </div>
                    <Users2 className="size-6 text-white/80" />
                  </div>
                  <div className="relative mt-6 flex flex-wrap items-center gap-3 text-xs font-medium text-white/80">
                    <span className={`rounded-full px-3 py-1 ${accent.chip}`}>
                      {pending} live
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                      {completed} done
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 rounded-4xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_50px_180px_-80px_rgba(139,92,246,0.45)] backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 shadow-inner">
                <BarChart3 size={16} className="text-white/60" />
                {selectedGroup ? (
                  <span>
                    {selectedGroup.tasks.length} total ·{" "}
                    {selectedGroup.tasks.filter(
                      (task) => task.status !== "done",
                    ).length}{" "}
                    open loops
                  </span>
                ) : (
                  <span>No groups yet</span>
                )}
              </div>
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm text-white/80 shadow-inner">
                <Filter size={16} className="text-white/60" />
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as TaskStatus | "all")
                  }
                  className="bg-transparent text-white focus-visible:outline-none"
                >
                  <option value="all">All statuses</option>
                  {STATUS_SEQUENCE.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_META[status].label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm text-white/80 shadow-inner">
                <Tag size={16} className="text-white/60" />
                <input
                  type="search"
                  placeholder="Search tasks, tags, names..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-48 bg-transparent text-white placeholder:text-white/50 focus-visible:outline-none sm:w-64"
                />
              </label>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/20">
              <input
                type="checkbox"
                checked={focusMode}
                onChange={(event) => setFocusMode(event.target.checked)}
                className="size-4 rounded border border-white/30 bg-transparent text-sky-400 focus-visible:outline-none"
              />
              Focus mode
              <span className="text-xs uppercase tracking-[0.28em] text-white/50">
                Urgency lens
              </span>
            </label>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {statusesToRender.map((status) => (
              <div
                key={status}
                className="relative flex min-h-[320px] flex-col gap-4 rounded-4xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-white/60">
                      {STATUS_META[status].label}
                    </div>
                    <div className="mt-1 text-3xl font-semibold text-white">
                      {statusBuckets[status].length}
                    </div>
                  </div>
                  <div
                    className={`inline-flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70`}
                  >
                    {statusIcon(status)}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4">
                  {statusBuckets[status].length ? (
                    statusBuckets[status].map((task) => (
                      <article
                        key={task.id}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_80px_-60px_rgba(94,234,212,0.6)] transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/12"
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${STATUS_META[task.status].glow} opacity-50`}
                        />
                        <div className="relative space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${STATUS_META[task.status].chip}`}
                            >
                              <span className="size-2 rounded-full bg-current" />
                              {STATUS_META[task.status].label}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCompletion(task.id)}
                              className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100 transition hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
                            >
                              {task.status === "done" ? "Reopen" : "Mark done"}
                            </button>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold leading-tight text-white">
                              {task.title}
                            </h3>
                            {task.summary ? (
                              <p className="mt-2 text-sm text-slate-200/75">
                                {task.summary}
                              </p>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200/80">
                            <span
                              className={`rounded-full px-3 py-1 ${PRIORITY_META[task.priority].chip}`}
                            >
                              {PRIORITY_META[task.priority].label}
                            </span>
                            {task.dueDate ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-slate-100/80">
                                <CalendarDays size={12} />
                                {formatRelative(task.dueDate)}
                              </span>
                            ) : null}
                            {task.owner ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                                <Users2 size={12} />
                                {task.owner}
                              </span>
                            ) : null}
                            {task.tags.map((tagValue) => (
                              <span
                                key={tagValue}
                                className="rounded-full bg-white/10 px-2 py-1 text-[0.7rem] uppercase tracking-widest text-white/70"
                              >
                                {tagValue}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between gap-3 text-sm text-white/70">
                            <div className="flex items-center gap-2">
                              {STATUS_SEQUENCE.filter(
                                (item) => item !== task.status,
                              ).map((statusOption) => (
                                <button
                                  key={statusOption}
                                  type="button"
                                  onClick={() =>
                                    updateTaskStatus(task.id, statusOption)
                                  }
                                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                >
                                  {STATUS_META[statusOption].label}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 transition hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40"
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5/50 p-6 text-center text-sm text-white/50">
                      <div className="mb-3 rounded-full border border-white/10 bg-white/10 p-3 text-white/70">
                        {statusIcon(status)}
                      </div>
                      <p>
                        No tasks in{" "}
                        <span className="font-medium text-white/80">
                          {STATUS_META[status].label}
                        </span>{" "}
                        yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => setTaskModalOpen(true)}
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                      >
                        <Plus size={12} />
                        Add task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <TaskDialog
        open={isTaskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          resetTaskForm();
        }}
        onSubmit={submitTask}
        taskForm={taskForm}
        groups={groups}
        onChange={handleTaskFormChange}
      />

      <GroupDialog
        open={isGroupModalOpen}
        onClose={() => {
          setGroupModalOpen(false);
          resetGroupForm();
        }}
        onSubmit={submitGroup}
        groupForm={groupForm}
        onChange={handleGroupFormChange}
      />
    </div>
  );
}

function statusIcon(status: TaskStatus) {
  switch (status) {
    case "backlog":
      return <Sparkles size={18} className="text-white/70" />;
    case "in-progress":
      return <Clock3 size={18} className="text-white/70" />;
    case "review":
      return <BarChart3 size={18} className="text-white/70" />;
    case "done":
      return <CheckCircle2 size={18} className="text-white/70" />;
    default:
      return <Sparkles size={18} className="text-white/70" />;
  }
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.replace(/\s+/g, "-").toLowerCase());
}

function isFocusCandidate(task: Task): boolean {
  if (task.status === "done") return false;
  if (task.priority === "critical") return true;
  if (task.status === "in-progress" || task.status === "review") return true;
  if (!task.dueDate) return false;
  const due = parseDate(task.dueDate);
  if (!due) return false;
  const now = new Date();
  const midnightNow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const diffDays =
    (due.getTime() - midnightNow.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 3;
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatRelative(isoDate: string) {
  const date = parseDate(isoDate);
  if (!date) return "Flexible";
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const formatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
  if (diffDays < 0) {
    return `Overdue · ${formatted}`;
  }
  if (diffDays === 0) {
    return `Due today · ${formatted}`;
  }
  if (diffDays === 1) {
    return `Due tomorrow · ${formatted}`;
  }
  if (diffDays <= 7) {
    return `Due in ${diffDays} days · ${formatted}`;
  }
  return formatted;
}

function BackgroundAurora() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-violet-500/30 blur-[140px]" />
      <div className="absolute -bottom-10 left-1/3 h-80 w-80 rounded-full bg-emerald-500/20 blur-[120px]" />
    </div>
  );
}

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  tone?: string;
  caption?: string;
}

function InsightCard({ icon, title, value, tone, caption }: InsightCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-5 text-white backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/0 to-transparent opacity-70" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.28em] text-white/60">
            {title}
          </div>
          <div className={`text-3xl font-semibold ${tone ?? "text-white"}`}>
            {value}
          </div>
          {caption ? (
            <p className="text-xs text-white/60">{caption}</p>
          ) : null}
        </div>
        <div className="rounded-full border border-white/10 bg-white/10 p-3 text-white/70">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  taskForm: TaskFormState;
  groups: WorkGroup[];
  onChange: (field: keyof TaskFormState) => (value: string) => void;
}

function TaskDialog({
  open,
  onClose,
  onSubmit,
  taskForm,
  groups,
  onChange,
}: TaskDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-10 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-4xl border border-white/10 bg-white/10 p-8 text-white shadow-[0_60px_180px_-80px_rgba(56,189,248,0.7)] backdrop-blur-3xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-sm text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          Close
        </button>
        <form onSubmit={onSubmit} className="space-y-6 text-sm">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Craft a new task
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Drop in context, set momentum, and assign effortlessly.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/60">
                Title
              </span>
              <input
                value={taskForm.title}
                onChange={(event) => onChange("title")(event.target.value)}
                required
                placeholder="Party A kickoff sync"
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/60">
                Owner
              </span>
              <input
                value={taskForm.owner}
                onChange={(event) => onChange("owner")(event.target.value)}
                placeholder="Add steward"
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/60">
                Summary
              </span>
              <textarea
                value={taskForm.summary}
                onChange={(event) => onChange("summary")(event.target.value)}
                rows={3}
                placeholder="Outline the ambition for the crew."
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/60">
                Due date
              </span>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(event) => onChange("dueDate")(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/60">
                Priority
              </span>
              <select
                value={taskForm.priority}
                onChange={(event) =>
                  onChange("priority")(event.target.value as TaskPriority)
                }
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
              >
                {Object.entries(PRIORITY_META).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/60">
                Status
              </span>
              <select
                value={taskForm.status}
                onChange={(event) =>
                  onChange("status")(event.target.value as TaskStatus)
                }
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
              >
                {STATUS_SEQUENCE.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_META[status].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/60">
                Tags
              </span>
              <input
                value={taskForm.tags}
                onChange={(event) => onChange("tags")(event.target.value)}
                placeholder="strategy, insights, delivery"
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60"
              />
              <span className="text-xs text-white/40">
                Separate by commas · we auto-convert to slugs
              </span>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.28em] text-white/60">
                Party
              </span>
              <select
                value={taskForm.groupId}
                onChange={(event) => onChange("groupId")(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.28em] text-white/50">
              Task blueprint
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <Plus size={16} />
              Create task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface GroupDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  groupForm: GroupFormState;
  onChange: (field: keyof GroupFormState) => (value: string) => void;
}

function GroupDialog({
  open,
  onClose,
  onSubmit,
  groupForm,
  onChange,
}: GroupDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-12 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-4xl border border-white/10 bg-white/10 p-8 text-white shadow-[0_60px_180px_-80px_rgba(147,197,253,0.65)] backdrop-blur-3xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-sm text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          Close
        </button>
        <form onSubmit={onSubmit} className="space-y-6 text-sm">
          <div>
            <h2 className="text-2xl font-semibold text-white">New party</h2>
            <p className="mt-1 text-sm text-white/70">
              Create a fresh collaboration stream for another crew.
            </p>
          </div>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.28em] text-white/60">
              Party name
            </span>
            <input
              value={groupForm.name}
              onChange={(event) => onChange("name")(event.target.value)}
              placeholder="Party C"
              required
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.28em] text-white/60">
              Tagline
            </span>
            <input
              value={groupForm.tagline}
              onChange={(event) => onChange("tagline")(event.target.value)}
              placeholder="What is their mission?"
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
            />
            <span className="text-xs text-white/40">
              We auto-assign a gradient theme; you can adjust styles later in
              code.
            </span>
          </label>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.28em] text-white/50">
              Party blueprint
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <Plus size={16} />
              Create party
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
