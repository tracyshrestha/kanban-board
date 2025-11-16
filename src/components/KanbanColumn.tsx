import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column, TaskStatus } from '@/types/task';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskCard } from './TaskCard';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { AddTaskDialog } from './AddTaskDialog';

interface KanbanColumnProps {
  column: Column;
}

export const KanbanColumn = ({ column }: KanbanColumnProps) => {
  const { tasks, filter, statusFilter } = useTaskStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const columnTasks = tasks
    .filter((task) => task.status === column.id)
    .filter((task) => {
      const matchesText = task.title.toLowerCase().includes(filter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      return matchesText && matchesStatus;
    })
    .sort((a, b) => a.order - b.order);

  const taskIds = columnTasks.map((task) => task.id);

  const getColumnColor = (status: TaskStatus) => {
    const colorMap = {
      'todo': 'bg-todo/10 border-todo/30',
      'in-progress': 'bg-in-progress/10 border-in-progress/30',
      'done': 'bg-done/10 border-done/30',
    };
    return colorMap[status];
  };

  const getHeaderColor = (status: TaskStatus) => {
    const colorMap = {
      'todo': 'bg-todo text-todo-foreground',
      'in-progress': 'bg-in-progress text-in-progress-foreground',
      'done': 'bg-done text-done-foreground',
    };
    return colorMap[status];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col"
    >
      <div className={`rounded-t-lg px-4 py-3 flex items-center justify-between ${getHeaderColor(column.id)}`}>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <span className="text-xs opacity-80 font-medium">
            {columnTasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-white/20"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-lg border-2 border-t-0 transition-colors min-h-[400px] p-4 ${
          getColumnColor(column.id)
        } ${isOver ? 'ring-2 ring-primary' : ''}`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {columnTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>

        {columnTasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Drop tasks here
          </div>
        )}
      </div>

      <AddTaskDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        defaultStatus={column.id}
      />
    </motion.div>
  );
};
