import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '@/types/task';
import type { ColumnId } from '@/types/board';

interface TaskState {
  tasks: Task[];
  filter: string;
  statusFilter: ColumnId[];
  addTask: (title: string, columnId: ColumnId) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  deleteTasksInColumn: (columnId: ColumnId) => void;
  moveTask: (id: string, newColumnId: ColumnId, newOrder: number) => void;
  setFilter: (filter: string) => void;
  setStatusFilter: (columnIds: ColumnId[]) => void;
  toggleStatusFilter: (columnId: ColumnId) => void;
  clearStatusFilter: () => void;
  reorderTasks: (columnId: ColumnId, taskIds: string[]) => void;
  toggleTaskComplete: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      filter: '',
      statusFilter: [],

      addTask: (title, columnId) =>
        set((state) => {
          const tasksInColumn = state.tasks.filter((t) => t.status === columnId);
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
                status: columnId,
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

      deleteTasksInColumn: (columnId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.status !== columnId),
          statusFilter: state.statusFilter.filter((id) => id !== columnId),
        })),

      moveTask: (id, newColumnId, newOrder) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          const otherTasks = state.tasks.filter((t) => t.id !== id);
          const tasksInNewColumn = otherTasks.filter(
            (t) => t.status === newColumnId
          );

          const reorderedTasks = tasksInNewColumn
            .sort((a, b) => a.order - b.order)
            .map((t, index) => ({
              ...t,
              order: index >= newOrder ? index + 1 : index,
            }));

          const updatedTask = {
            ...task,
            status: newColumnId,
            order: newOrder,
          };

          const finalTasks = [
            ...otherTasks.filter((t) => t.status !== newColumnId),
            ...reorderedTasks,
            updatedTask,
          ];

          return { tasks: finalTasks };
        }),

      setFilter: (filter) => set({ filter }),

      setStatusFilter: (statusFilter) => set({ statusFilter }),

      toggleStatusFilter: (columnId) =>
        set((state) => {
          const isSelected = state.statusFilter.includes(columnId);
          return {
            statusFilter: isSelected
              ? state.statusFilter.filter((id) => id !== columnId)
              : [...state.statusFilter, columnId],
          };
        }),

      clearStatusFilter: () => set({ statusFilter: [] }),

      reorderTasks: (columnId, taskIds) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.status === columnId) {
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
    }),
    {
      name: 'kanban-storage',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<TaskState> & {
          statusFilter?: ColumnId | ColumnId[] | 'all';
          columnOrder?: unknown;
        };
        let statusFilter: ColumnId[] = [];
        if (Array.isArray(p.statusFilter)) {
          statusFilter = p.statusFilter;
        } else if (p.statusFilter && p.statusFilter !== 'all') {
          statusFilter = [p.statusFilter];
        }
        return {
          ...current,
          tasks: p.tasks ?? current.tasks,
          filter: p.filter ?? current.filter,
          statusFilter,
        };
      },
    }
  )
);
