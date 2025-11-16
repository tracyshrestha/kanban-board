import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Column } from '@/types/task';
import { COLUMNS } from '@/types/task';

interface BoardState {
  columns: Column[];
  addColumn: (title: string) => void;
  deleteColumn: (id: string) => void;
  updateColumn: (id: string, updates: Partial<Column>) => void;
  reorderColumns: (newOrder: string[]) => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      // Initialize with default columns if not already set
      columns: COLUMNS,

      addColumn: (title) =>
        set((state) => {
          const newId = `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newColumn: Column = {
            id: newId,
            title,
            color: 'todo', // Default color, can be customized later
          };
          return {
            columns: [...state.columns, newColumn],
          };
        }),

      deleteColumn: (id) =>
        set((state) => ({
          columns: state.columns.filter((col) => col.id !== id),
        })),

      updateColumn: (id, updates) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, ...updates } : col
          ),
        })),

      reorderColumns: (newOrder: string[]) =>
        set((state) => {
          // Create a map for quick column lookup
          const columnMap = new Map(state.columns.map(col => [col.id, col]));
          
          // Reorder columns based on the newOrder array
          const reorderedColumns = newOrder
            .map(id => columnMap.get(id))
            .filter((col): col is Column => col !== undefined);
          
          return {
            columns: reorderedColumns,
          };
        }),
    }),
    {
      name: 'board-storage',
    }
  )
);