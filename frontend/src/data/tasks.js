export const columns = [
  { id: "todo", title: "To-Do", color: "gray" },
  { id: "in-progress", title: "In Progress", color: "blue" },
  { id: "completed", title: "Completed", color: "green" },
  { id: "feedback", title: "Feedback", color: "yellow" },
];

export const tasks = [
  {
    id: "1",
    title: "Complete React Hooks Tutorial",
    description: "Learn useState, useEffect, and custom hooks",
    column: "todo",
    tags: ["React", "Frontend"],
    priority: "high",
    createdAt: "2025-11-10",
  },
  {
    id: "2",
    title: "Design System Research",
    description: "Explore Linear, Notion, and Vercel design patterns",
    column: "todo",
    tags: ["Design", "UI/UX"],
    priority: "medium",
    createdAt: "2025-11-09",
  },
  {
    id: "3",
    title: "API Integration with Next.js",
    description: "Implement RESTful API endpoints and data fetching",
    column: "in-progress",
    tags: ["Backend", "Next.js"],
    priority: "high",
    createdAt: "2025-11-08",
  },
  {
    id: "4",
    title: "Database Schema Design",
    description: "Create ER diagram and plan data relationships",
    column: "in-progress",
    tags: ["Database", "Planning"],
    priority: "medium",
    createdAt: "2025-11-07",
  },
  {
    id: "5",
    title: "TypeScript Fundamentals",
    description: "Master types, interfaces, and generics",
    column: "completed",
    tags: ["TypeScript", "Learning"],
    priority: "high",
    createdAt: "2025-11-01",
  },
  {
    id: "6",
    title: "Git Workflow Setup",
    description: "Configure branches, PR templates, and CI/CD",
    column: "completed",
    tags: ["DevOps", "Git"],
    priority: "low",
    createdAt: "2025-11-03",
  },
  {
    id: "7",
    title: "Code Review: Dashboard UI",
    description: "Review component architecture and styling patterns",
    column: "feedback",
    tags: ["Review", "Frontend"],
    priority: "medium",
    createdAt: "2025-11-06",
  },
//   {
//     id: "8",
//     title: "Performance Optimization",
//     description: "Analyze bundle size and implement lazy loading",
//     column: "feedback",
//     tags: ["Performance", "Optimization"],
//     priority: "high",
//     createdAt: "2025-11-05",
//   },
];

export function getTasksByColumn(columnId) {
  return tasks.filter((task) => task.column === columnId);
}

export function getColumnColor(columnId) {
  const column = columns.find((col) => col.id === columnId);
  return column ? column.color : "gray";
}
