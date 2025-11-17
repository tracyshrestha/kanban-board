import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Task, TaskStatus } from '@/types/task';
import { useTaskStore } from '@/store/useTaskStore';
import { COLUMNS } from '@/types/task';

interface EditTaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTaskDialog = ({ task, isOpen, onClose }: EditTaskDialogProps) => {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const { updateTask } = useTaskStore();

  useEffect(() => {
    setTitle(task.title);
    setStatus(task.status);
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      updateTask(task.id, { title: title.trim(), status });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className='text-primary-foreground'>Card Title</Label>
            <Input
              id="edit-title"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
               className='border-primary-foreground text-primary-foreground'
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status" className='text-primary-foreground'>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
              <SelectTrigger id="edit-status" className="border-primary-foreground text-primary-foreground w-full">
                <SelectValue className='text-primary-foreground'/>
              </SelectTrigger>
              <SelectContent>
                {COLUMNS.map((column) => (
                  <SelectItem key={column.id} value={column.id} >
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className='text-primary-foreground'>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
