import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, type DragOverEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useBoardStore } from '@/store/useBoardStore';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { AddBoard } from './AddBoard';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export const KanbanBoard = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const { tasks, moveTask } = useTaskStore();
  const { columns, addColumn } = useBoardStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask) return;

    // If over a task, reorder within the same column or move to different column
    if (overTask) {
      if (activeTask.status === overTask.status) {
        // Reordering within the same column
        const tasksInColumn = tasks
          .filter(t => t.status === activeTask.status)
          .sort((a, b) => a.order - b.order);
        
        const oldIndex = tasksInColumn.findIndex(t => t.id === activeId);
        const newIndex = tasksInColumn.findIndex(t => t.id === overId);
        
        if (oldIndex !== newIndex) {
          const newTaskIds = [...tasksInColumn.map(t => t.id)];
          newTaskIds.splice(oldIndex, 1);
          newTaskIds.splice(newIndex, 0, activeId);
          
          const { reorderTasks } = useTaskStore.getState();
          reorderTasks(activeTask.status, newTaskIds);
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column
    const overColumn = columns.find(col => col.id === overId);
    if (overColumn) {
      const tasksInColumn = tasks.filter(t => t.status === overColumn.id);
      moveTask(activeId, overColumn.id, tasksInColumn.length);
      setActiveId(null);
      return;
    }

    // Check if dropped over a task from different column
    const overTask = tasks.find(t => t.id === overId);
    const activeTask = tasks.find(t => t.id === activeId);
    if (overTask && activeTask && activeTask.status !== overTask.status) {
      moveTask(activeId, overTask.status, overTask.order);
    }

    setActiveId(null);
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  const handleSaveBoard = (name: string) => {
    addColumn(name);
    setIsAddingBoard(false);
  };

  const handleCancelBoard = () => {
    setIsAddingBoard(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0">
            <KanbanColumn column={column} />
          </div>
        ))}
        
        {isAddingBoard ? (
          <div className="flex-shrink-0">
            <AddBoard onSave={handleSaveBoard} onCancel={handleCancelBoard} />
          </div>
        ) : (
          <div className="flex-shrink-0">
            <Button
              onClick={() => setIsAddingBoard(true)}
              variant="outline"
              className="min-w-[280px] h-[400px] border-2 border-dashed border-muted-foreground/30 bg-muted/30 hover:bg-muted/50 flex flex-col items-center justify-center gap-2"
            >
              <Plus className="h-6 w-6" />
              <span>Add another list</span>
            </Button>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-80">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
