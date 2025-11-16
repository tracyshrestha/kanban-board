import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types/task';
import { motion } from 'framer-motion';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useTaskStore } from '@/store/useTaskStore';
import { useState } from 'react';
import { EditTaskDialog } from './EditTaskDialog';
import { Checkbox } from './ui/checkbox';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export const TaskCard = ({ task, isDragging = false }: TaskCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { deleteTask, toggleTaskComplete } = useTaskStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-2">
          <GripVertical className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-card-foreground">{task.title}</h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        className={`bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-all group ${
          isSortableDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-start gap-2">
           <div className={`transition-opacity ${task.completed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <Checkbox
              checked={task.completed || false}
              onCheckedChange={() => toggleTaskComplete(task.id)}
              className="mt-0.5 rounded-full"
            />
          </div>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-card-foreground break-words `}>
              {task.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <EditTaskDialog
        task={task}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </>
  );
};
