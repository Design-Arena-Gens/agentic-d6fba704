import { TaskDashboard, type WorkGroup } from "@/components/task-dashboard";

const today = new Date();

const formatDate = (offsetDays: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const initialGroups: WorkGroup[] = [
  {
    id: "party-a",
    name: "Party A",
    tagline: "Strategy pod stewarding launch orchestration",
    accent: "emerald",
    tasks: [
      {
        id: "party-a-1",
        title: "Immersion brief and scope alignment",
        summary:
          "Synthesize the latest intelligence, align expectations, and lock the north-star success metrics for the workstream.",
        status: "in-progress",
        priority: "high",
        dueDate: formatDate(2),
        tags: ["alignment", "briefing"],
        owner: "Maya",
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      },
      {
        id: "party-a-2",
        title: "Party A discovery sprints scheduling",
        summary:
          "Coordinate stakeholder interviews, confirm availability, and ensure insights capture templates are ready.",
        status: "backlog",
        priority: "medium",
        dueDate: formatDate(5),
        tags: ["ops", "calendar"],
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      },
      {
        id: "party-a-3",
        title: "Design system moodboard share-out",
        summary:
          "Curate the visual narrative and circulate to get Party A alignment before visual exploration takes off.",
        status: "review",
        priority: "critical",
        dueDate: formatDate(1),
        tags: ["design", "strategy"],
        owner: "Liam",
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      },
    ],
  },
  {
    id: "party-b",
    name: "Party B",
    tagline: "Delivery squad shaping execution cadence",
    accent: "violet",
    tasks: [
      {
        id: "party-b-1",
        title: "Technical architecture map",
        summary:
          "Diagram the integration touchpoints, define the service contracts, and validate with engineering leads.",
        status: "in-progress",
        priority: "high",
        dueDate: formatDate(4),
        tags: ["engineering", "systems"],
        owner: "Priya",
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      },
      {
        id: "party-b-2",
        title: "QA swimlane build-out",
        summary:
          "Draft acceptance criteria, spin up the regression suite, and align QA and delivery on definition of done.",
        status: "backlog",
        priority: "medium",
        dueDate: formatDate(7),
        tags: ["quality", "process"],
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      },
      {
        id: "party-b-3",
        title: "Retro cadence reboot",
        summary:
          "Introduce the new format, confirm facilitation roster, and collect pre-reads so the first session lands.",
        status: "done",
        priority: "low",
        dueDate: formatDate(-1),
        tags: ["rituals"],
        owner: "Noah",
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      },
    ],
  },
  {
    id: "party-c",
    name: "Party C",
    tagline: "Lifecycle guardians keeping the customer close",
    accent: "amber",
    tasks: [
      {
        id: "party-c-1",
        title: "Voice of customer digest",
        summary:
          "Compile fresh feedback, tag sentiment swings, and push a narrative read-out to both Party A and B.",
        status: "review",
        priority: "critical",
        dueDate: formatDate(0),
        tags: ["customer", "insights"],
        owner: "Asha",
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      },
      {
        id: "party-c-2",
        title: "Lifecycle nurture revamp",
        summary:
          "Design the refreshed sequence, craft copy explorations, and collaborate with Party B on automation.",
        status: "backlog",
        priority: "high",
        dueDate: formatDate(9),
        tags: ["growth", "copy"],
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      },
      {
        id: "party-c-3",
        title: "Analytic instrumentation audit",
        summary:
          "Map existing events, identify the coverage gaps, and propose instrumentation expansions.",
        status: "in-progress",
        priority: "medium",
        dueDate: formatDate(6),
        tags: ["analytics"],
        owner: "Elliot",
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      },
    ],
  },
];

export default function Home() {
  return <TaskDashboard initialGroups={initialGroups} />;
}
