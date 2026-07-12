import { create } from "zustand";

export const useTaskStore = create((set, get) => ({
  tasks: [],

  // Set tasks (replace all tasks with backend tasks)
  setTasks: (backendTasks) => {
    set({
      tasks: backendTasks,
    });
  },

  // Add a new task
  addTask: (newTask) => {
    set((state) => ({
      tasks: [...state.tasks, newTask],
    }));
  },

  // Update an existing task
  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  },

  // Delete a task
  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  },

  // Move task to a different column
  moveTask: (taskId, newColumn) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, column: newColumn } : task
      ),
    }));
  },

  // Get tasks by column (helper method)
  getTasksByColumn: (columnId) => {
    return get().tasks.filter((task) => task.column === columnId);
  },
}));
