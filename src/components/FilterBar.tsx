import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { useTaskStore } from '@/store/useTaskStore';
import { useBoardStore } from '@/store/useBoardStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const FilterBar = () => {
  const { filter, statusFilter, setFilter, setStatusFilter } = useTaskStore();
  const { columns } = useBoardStore();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as any)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {columns.map((column) => (
            <SelectItem key={column.id} value={column.id}>
              {column.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
