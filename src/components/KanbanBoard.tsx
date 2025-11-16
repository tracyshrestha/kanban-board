import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, type DragOverEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useBoardStore } from '@/store/useBoardStore';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { AddBoard } from './AddBoard';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export const KanbanBoard = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'task' | 'column' | null>(null);
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [isDraggingBackground, setIsDraggingBackground] = useState(false);
  const [isHoveringScrollableArea, setIsHoveringScrollableArea] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const scrollStartX = useRef<number>(0);
  const { tasks, moveTask, filter, statusFilter } = useTaskStore();
  const { columns, addColumn, reorderColumns } = useBoardStore();
  
  // Filter columns to only show those that contain matching tasks
  const filteredColumns = columns.filter((column) => {
    const columnTasks = tasks.filter((task) => task.status === column.id);
    const matchingTasks = columnTasks.filter((task) => {
      const matchesText = filter === '' || task.title.toLowerCase().includes(filter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      return matchesText && matchesStatus;
    });
    // Show column if it has matching tasks, or if no filter is applied
    return matchingTasks.length > 0 || (filter === '' && statusFilter === 'all');
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    
    // Determine if dragging a task or a column
    const isColumn = filteredColumns.some(col => col.id === event.active.id);
    setActiveType(isColumn ? 'column' : 'task');
    setIsDraggingBackground(false);
    setIsHoveringScrollableArea(false); // Reset hover state when dragging starts
  };

  // Check if an element is scrollable empty space
  const isScrollableEmptySpace = (target: HTMLElement): boolean => {
    // Don't interfere if dnd-kit is handling a drag
    if (activeId) return false;
    
    // Check if clicking directly on interactive elements (buttons, inputs, etc.)
    const isDirectlyOnInteractive = 
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.getAttribute('role') === 'button';
    
    // Check if clicking on task cards (we don't want to scroll when clicking on tasks)
    const isOnTaskCard = target.closest('.bg-card') !== null;
    
    // Check if clicking on column header (we don't want to scroll when clicking on headers)
    const isOnColumnHeader = target.closest('[class*="rounded-t-lg"]') !== null;
    
    // Check if clicking on the column body area (the droppable area with rounded-b-lg)
    const columnBody = target.closest('[class*="rounded-b-lg"]');
    const isOnColumnBody = columnBody !== null;
    
    // If clicking on column body, check if it's empty space (not on a task or button)
    const isEmptySpaceInColumnBody = isOnColumnBody && !isOnTaskCard && !isDirectlyOnInteractive;
    
    // Return true if it's scrollable empty space
    return ((!isDirectlyOnInteractive && !isOnTaskCard && !isOnColumnHeader) || isEmptySpaceInColumnBody);
  };

  // Handle background drag for horizontal scrolling
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (isScrollableEmptySpace(target)) {
      setIsDraggingBackground(true);
      dragStartX.current = e.clientX;
      if (scrollContainerRef.current) {
        scrollStartX.current = scrollContainerRef.current.scrollLeft;
      }
      e.preventDefault();
    }
  };

  // Handle mouse move to detect scrollable areas
  const handleBackgroundMouseMove = (e: React.MouseEvent) => {
    if (isDraggingBackground && scrollContainerRef.current) {
      const deltaX = dragStartX.current - e.clientX;
      scrollContainerRef.current.scrollLeft = scrollStartX.current + deltaX;
    } else if (!activeId) {
      // Check if hovering over scrollable empty space
      const target = e.target as HTMLElement;
      setIsHoveringScrollableArea(isScrollableEmptySpace(target));
    }
  };

  const handleBackgroundMouseUp = () => {
    setIsDraggingBackground(false);
  };

  const handleBackgroundMouseLeave = () => {
    setIsDraggingBackground(false);
    setIsHoveringScrollableArea(false);
  };

  // Handle global mouse events for background dragging
  useEffect(() => {
    if (isDraggingBackground) {
      const handleMouseMove = (e: MouseEvent) => {
        if (scrollContainerRef.current) {
          const deltaX = dragStartX.current - e.clientX;
          scrollContainerRef.current.scrollLeft = scrollStartX.current + deltaX;
        }
      };

      const handleMouseUp = () => {
        setIsDraggingBackground(false);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingBackground]);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || activeType !== 'task') return;

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
      setActiveType(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column reordering
    if (activeType === 'column') {
      const columnIds = filteredColumns.map(col => col.id);
      const oldIndex = columnIds.indexOf(activeId);
      const newIndex = columnIds.indexOf(overId);
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newColumnOrder = arrayMove(columnIds, oldIndex, newIndex);
        reorderColumns(newColumnOrder);
      }
      
      setActiveId(null);
      setActiveType(null);
      return;
    }

    // Handle task movement
    // Check if dropped over a column (only visible/filtered columns can be drop targets)
    const overColumn = filteredColumns.find(col => col.id === overId);
    if (overColumn) {
      const tasksInColumn = tasks.filter(t => t.status === overColumn.id);
      moveTask(activeId, overColumn.id, tasksInColumn.length);
      setActiveId(null);
      setActiveType(null);
      return;
    }

    // Check if dropped over a task from different column
    const overTask = tasks.find(t => t.id === overId);
    const activeTask = tasks.find(t => t.id === activeId);
    if (overTask && activeTask && activeTask.status !== overTask.status) {
      moveTask(activeId, overTask.status, overTask.order);
    }

    setActiveId(null);
    setActiveType(null);
  };

  const activeTask = activeId && activeType === 'task' ? tasks.find(t => t.id === activeId) : null;
  const activeColumn = activeId && activeType === 'column' ? filteredColumns.find(c => c.id === activeId) : null;

  const columnIds = filteredColumns.map(col => col.id);

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
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <div
          ref={scrollContainerRef}
          className={`flex gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            isDraggingBackground 
              ? 'cursor-grabbing' 
              : isHoveringScrollableArea 
                ? 'cursor-grab' 
                : ''
          }`}
          onMouseDown={handleBackgroundMouseDown}
          onMouseMove={handleBackgroundMouseMove}
          onMouseUp={handleBackgroundMouseUp}
          onMouseLeave={handleBackgroundMouseLeave}
          style={{ userSelect: isDraggingBackground ? 'none' : 'auto' }}
        >
          {filteredColumns.map((column) => (
            <div key={column.id} className="shrink-0" data-draggable="true">
              <KanbanColumn column={column} />
            </div>
          ))}
          
          {isAddingBoard ? (
            <div className="shrink-0">
              <AddBoard onSave={handleSaveBoard} onCancel={handleCancelBoard} />
            </div>
          ) : (
            <div className="shrink-0">
              <Button
                onClick={() => setIsAddingBoard(true)}
                variant="outline"
                className="min-w-[280px] h-10 border-2 border-muted-foreground/30 bg-muted/30 hover:bg-muted/50 flex items-center justify-center gap-2"
              >
                <Plus className="h-6 w-6" />
                <span>Add another list</span>
              </Button>
            </div>
          )}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-80">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : activeColumn ? (
          <div className="opacity-80">
            <KanbanColumn column={activeColumn} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};