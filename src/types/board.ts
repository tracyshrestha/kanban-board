/** Id of a board column; tasks reference this via `status`. */
export type ColumnId = string;

export interface Column {
  id: ColumnId;
  title: string;
  color: string;
}

/** Seed columns used to initialize the board store. */
export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: 'todo' },
  { id: 'in-progress', title: 'In Progress', color: 'in-progress' },
  { id: 'done', title: 'Done', color: 'done' },
];
