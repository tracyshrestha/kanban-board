import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Column, ColumnId } from '@/types/board';
import { DEFAULT_COLUMNS } from '@/types/board';
import { useTaskStore } from '@/store/useTaskStore';

interface BoardState {
  columns: Column[];
  collapsedColumns: Record<ColumnId, boolean>;
  addColumn: (title: string) => void;
  deleteColumn: (id: ColumnId) => void;
  updateColumn: (id: ColumnId, updates: Partial<Column>) => void;
  reorderColumns: (newOrder: ColumnId[]) => void;
  toggleColumnCollapsed: (id: ColumnId) => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      columns: DEFAULT_COLUMNS,
      collapsedColumns: {},

      addColumn: (title) =>
        set((state) => {
          const newId: ColumnId = `column-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
          const newColumn: Column = {
            id: newId,
            title,
            color: 'todo',
          };
          return {
            columns: [...state.columns, newColumn],
          };
        }),

      deleteColumn: (id) => {
        // Remove orphaned tasks and clear related filters before dropping the column
        useTaskStore.getState().deleteTasksInColumn(id);
        set((state) => {
          const { [id]: _removed, ...restCollapsed } = state.collapsedColumns;
          return {
            columns: state.columns.filter((col) => col.id !== id),
            collapsedColumns: restCollapsed,
          };
        });
      },

      updateColumn: (id, updates) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, ...updates } : col
          ),
        })),

      reorderColumns: (newOrder) =>
        set((state) => {
          const columnMap = new Map(state.columns.map((col) => [col.id, col]));

          const reorderedColumns = newOrder
            .map((id) => columnMap.get(id))
            .filter((col): col is Column => col !== undefined);

          return {
            columns: reorderedColumns,
          };
        }),

      toggleColumnCollapsed: (id) =>
        set((state) => ({
          collapsedColumns: {
            ...state.collapsedColumns,
            [id]: !state.collapsedColumns[id],
          },
        })),
    }),
    {
      name: 'board-storage',
    }
  )
);
