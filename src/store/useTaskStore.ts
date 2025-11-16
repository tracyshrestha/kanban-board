import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import  {type Task, type TaskStatus, COLUMNS } from '@/types/task';

interface TaskState {
  tasks: Task[];
  filter: string;
  statusFilter: TaskStatus | 'all';
  columnOrder: TaskStatus[];
  addTask: (title: string, status: TaskStatus) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus, newOrder: number) => void;
  setFilter: (filter: string) => void;
  setStatusFilter: (status: TaskStatus | 'all') => void;
  reorderTasks: (status: TaskStatus, taskIds: string[]) => void;
  toggleTaskComplete: (id: string) => void;
  reorderColumns: (columnIds: TaskStatus[]) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      filter: '',
      statusFilter: 'all',
      columnOrder: COLUMNS.map(col => col.id),

      addTask: (title, status) =>
        set((state) => {
          const tasksInColumn = state.tasks.filter((t) => t.status === status);
          const maxOrder = tasksInColumn.length > 0 
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
          const tasksInNewColumn = otherTasks.filter((t) => t.status === newStatus);

          // Reorder tasks in the new column
          const reorderedTasks = tasksInNewColumn
            .sort((a, b) => a.order - b.order)
            .map((t, index) => ({
              ...t,
              order: index >= newOrder ? index + 1 : index,
            }));

          // Update the moved task
          const updatedTask = {
            ...task,
            status: newStatus,
            order: newOrder,
          };

          // Combine all tasks
          const finalTasks = [
            ...otherTasks.filter((t) => t.status !== newStatus),
            ...reorderedTasks,
            updatedTask,
          ];

          return { tasks: finalTasks };
        }),

      setFilter: (filter) => set({ filter }),

      setStatusFilter: (statusFilter) => set({ statusFilter }),

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
        reorderColumns: (columnIds) =>
        set({ columnOrder: columnIds }),
    }),
    {
      name: 'kanban-storage',
    }
  )
);
