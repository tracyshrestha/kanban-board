export type TaskStatus = 'todo' | 'in-progress' | 'done' | string;

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  order: number;
  completed?: boolean;
}

export interface Column {
  id: string;
  title: string;
  color: string;
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: 'todo' },
  { id: 'in-progress', title: 'In Progress', color: 'in-progress' },
  { id: 'done', title: 'Done', color: 'done' },
];
