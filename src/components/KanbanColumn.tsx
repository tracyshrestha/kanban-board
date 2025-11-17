import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column, TaskStatus } from '@/types/task';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskCard } from './TaskCard';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { AddTaskDialog } from './AddTaskDialog';
import { BsArrowsAngleExpand } from "react-icons/bs";
import { BsArrowsAngleContract } from "react-icons/bs";

interface KanbanColumnProps {
  column: Column;
}

export const KanbanColumn = ({ column }: KanbanColumnProps) => {
  const { tasks, filter, statusFilter } = useTaskStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const columnTasks = tasks
    .filter((task) => task.status === column.id)
    .filter((task) => {
      const matchesText = task.title
        .toLowerCase()
        .includes(filter.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || task.status === statusFilter;
      return matchesText && matchesStatus;
    })
    .sort((a, b) => a.order - b.order);

  const taskIds = columnTasks.map((task) => task.id);

  const getColumnColor = (status: TaskStatus, columnColor?: string) => {
    const colorMap: Record<string, string> = {
      todo: "bg-background/10 border-todo/30",
      "in-progress": "bg-in-background/10 border-in-progress/30",
      done: "bg-background/10 border-done/30",
    };
    // Use column color if it exists, otherwise fall back to status-based color
    if (columnColor && colorMap[columnColor]) {
      return colorMap[columnColor];
    }
    return colorMap[status] || "bg-background border-muted/30";
  };

  const getHeaderColor = (status: TaskStatus, columnColor?: string) => {
    const colorMap: Record<string, string> = {
      todo: "bg-background text-todo-foreground",
      "in-progress": "bg-background text-todo-foreground",
      done: "bg-background text-todo-foreground",
    };
    // Use column color if it exists, otherwise fall back to status-based color
    if (columnColor && colorMap[columnColor]) {
      return colorMap[columnColor];
    }
    return colorMap[status] || "bg-background text-muted-foreground";
  };

  return (
    <motion.div
      ref={setSortableNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        width: isCollapsed ? "40px" : "auto",
      }}
      className="flex flex-col w-full max-w-[300px] "
    >
      {isCollapsed ? (
        // Collapsed vertical column view
        <>
          <div
            {...attributes}
            {...listeners}
            className={`rounded-xl px-2 py-3 flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing ${getHeaderColor(
              column.id
            )}`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-white/20" 
              onClick={() => setIsCollapsed(false)}
            >
              <BsArrowsAngleExpand className="h-0.5 w-0.5 [writing-mode:vertical-rl]" strokeWidth={1.5} />
            </Button>
            <h3 className="font-semibold text-sm [writing-mode:vertical-rl]">
              {column.title}
            </h3>
            <span className="text-xs opacity-80 font-medium [writing-mode:vertical-rl]">
              {columnTasks.length}
            </span>
          </div>

        </>
      ) : (
        // Expanded horizontal column view
        <>
          <div
            className={`rounded-t-xl px-4 py-3 min-w-[300px] flex items-center justify-between ${getHeaderColor(
              column.id,
              column.color
            )}`}
          >
            <div
              {...attributes}
              {...listeners}
              className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1"
            >
              <h3 className="font-semibold text-sm">{column.title}</h3>
              {/* <span className="text-xs opacity-80 font-medium">
                {columnTasks.length}
              </span> */}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-white/20"
                onClick={() => setIsCollapsed(true)}
              >
                <BsArrowsAngleContract className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-white/20"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            ref={setNodeRef}
            className={`flex-1 rounded-b-xl  transition-colors min-h-10 bg-background p-4 pb-5 ${getColumnColor(
              column.id,
              column.color
            )} ${isOver ? "ring-2 ring-primary" : ""}`}
          >
            <SortableContext
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </SortableContext>

            {columnTasks.length === 0 && (
              <div className="flex items-center justify-center h-8 text-sm">
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full bg-foreground hover:bg-card">
                  <Plus className="h-4 w-4" />
                  Add a card
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <AddTaskDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        defaultStatus={column.id}
      />
    </motion.div>
  );
};
