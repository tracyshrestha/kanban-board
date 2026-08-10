import type { ColumnId } from '@/types/board';

export interface Task {
  id: string;
  title: string;
  /** Id of the column this task belongs to. */
  status: ColumnId;
  createdAt: string;
  order: number;
  completed?: boolean;
}
