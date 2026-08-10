import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Task, type TaskStatus, COLUMNS } from '@/types/task';

interface TaskState {
  tasks: Task[];
  filter: string;
  statusFilter: TaskStatus[];
  columnOrder: TaskStatus[];
  addTask: (title: string, status: TaskStatus) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus, newOrder: number) => void;
  setFilter: (filter: string) => void;
  setStatusFilter: (statuses: TaskStatus[]) => void;
  toggleStatusFilter: (status: TaskStatus) => void;
  clearStatusFilter: () => void;
  reorderTasks: (status: TaskStatus, taskIds: string[]) => void;
  toggleTaskComplete: (id: string) => void;
  reorderColumns: (columnIds: TaskStatus[]) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      filter: '',
      statusFilter: [],
      columnOrder: COLUMNS.map((col) => col.id),

      addTask: (title, status) =>
        set((state) => {
          const tasksInColumn = state.tasks.filter((t) => t.status === status);
          const maxOrder =
            tasksInColumn.length > 0
              ? Math.max(...tasksInColumn.map((t) => t.order))
              : -1;

          return {
            tasks: [
              ...state.tasks,
              {
                id: crypto.randomUUID(),
                title,
                status,
                createdAt: new Date().toISOString(),
                order: maxOrder + 1,
              },
            ],
          };
        }),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      moveTask: (id, newStatus, newOrder) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          const otherTasks = state.tasks.filter((t) => t.id !== id);
          const tasksInNewColumn = otherTasks.filter(
            (t) => t.status === newStatus
          );

          const reorderedTasks = tasksInNewColumn
            .sort((a, b) => a.order - b.order)
            .map((t, index) => ({
              ...t,
              order: index >= newOrder ? index + 1 : index,
            }));

          const updatedTask = {
            ...task,
            status: newStatus,
            order: newOrder,
          };

          const finalTasks = [
            ...otherTasks.filter((t) => t.status !== newStatus),
            ...reorderedTasks,
            updatedTask,
          ];

          return { tasks: finalTasks };
        }),

      setFilter: (filter) => set({ filter }),

      setStatusFilter: (statusFilter) => set({ statusFilter }),

      toggleStatusFilter: (status) =>
        set((state) => {
          const isSelected = state.statusFilter.includes(status);
          return {
            statusFilter: isSelected
              ? state.statusFilter.filter((s) => s !== status)
              : [...state.statusFilter, status],
          };
        }),

      clearStatusFilter: () => set({ statusFilter: [] }),

      reorderTasks: (status, taskIds) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.status === status) {
              const newOrder = taskIds.indexOf(task.id);
              return newOrder !== -1 ? { ...task, order: newOrder } : task;
            }
            return task;
          }),
        })),

      toggleTaskComplete: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        })),

      reorderColumns: (columnIds) => set({ columnOrder: columnIds }),
    }),
    {
      name: 'kanban-storage',
      // Migrate legacy single status filter ("all" | status id) → array
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<TaskState> & {
          statusFilter?: TaskStatus | TaskStatus[] | 'all';
        };
        let statusFilter: TaskStatus[] = [];
        if (Array.isArray(p.statusFilter)) {
          statusFilter = p.statusFilter;
        } else if (p.statusFilter && p.statusFilter !== 'all') {
          statusFilter = [p.statusFilter];
        }
        return {
          ...current,
          ...p,
          statusFilter,
        };
      },
    }
  )
);
