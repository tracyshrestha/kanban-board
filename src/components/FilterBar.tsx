import { Search, Tag, X } from "lucide-react";
import { Input } from "./ui/input";
import { useTaskStore } from "@/store/useTaskStore";
import { useBoardStore } from "@/store/useBoardStore";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const FilterBar = () => {
  const { filter, statusFilter, setFilter, setStatusFilter } = useTaskStore();
  const { columns } = useBoardStore();
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Collapsed state - just the search icon
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="p-2 hover:bg-background/50 rounded-lg transition-colors"
        aria-label="Open search"
      >
        <Search className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
      </button>
    );
  }

  // Expanded state - full search bar with status filter
  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

        <Input
          placeholder="Search tasks..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9 pr-16 bg-background/50 backdrop-blur-sm"
          autoFocus
        />

        {/* Tag Filter */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="absolute right-9 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Tag className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              All Status
            </DropdownMenuItem>
            {columns.map((column) => (
              <DropdownMenuItem
                key={column.id}
                onClick={() => setStatusFilter(column.id)}
              >
                {column.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear + Collapse Button */}
        {(filter !== "" || statusFilter !== "all") && (
          <button
            onClick={() => {
              setFilter("");
              setStatusFilter("all");
              setOpen(false);
              setIsExpanded(false); // collapse search bar
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
