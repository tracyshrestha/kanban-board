import { Search, Tag, X, Check } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { useBoardStore } from "@/store/useBoardStore";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

export const FilterBar = () => {
  const isMobile = useIsMobile();
  const {
    filter,
    setFilter,
    statusFilter,
    toggleStatusFilter,
    clearStatusFilter,
  } = useTaskStore();
  const { columns } = useBoardStore();
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDraggingChips, setIsDraggingChips] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const selectedColumns = columns.filter((column) =>
    statusFilter.includes(column.id)
  );
  const hasTagFilter = selectedColumns.length > 0;
  const hasActiveFilters = hasTagFilter || filter.trim().length > 0;

  // Keep latest chip in view when selection grows
  useEffect(() => {
    const el = chipsScrollRef.current;
    if (!el || selectedColumns.length === 0) return;
    el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
  }, [selectedColumns.length]);

  // Focus input when mobile popup opens
  useEffect(() => {
    if (mobileOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [mobileOpen]);

  const handleChipPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;

    const el = chipsScrollRef.current;
    if (!el) return;

    dragState.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    setIsDraggingChips(true);
    el.setPointerCapture(e.pointerId);
  };

  const handleChipPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active || !chipsScrollRef.current) return;

    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 3) {
      dragState.current.moved = true;
    }
    chipsScrollRef.current.scrollLeft = dragState.current.scrollLeft - dx;
  };

  const handleChipPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    setIsDraggingChips(false);
    try {
      chipsScrollRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // already released
    }
  };

  const handleClearAll = () => {
    setFilter("");
    clearStatusFilter();
    setTagMenuOpen(false);
    setIsExpanded(false);
    setMobileOpen(false);
  };

  const searchField = (
    <div
      className={`flex items-center w-full min-w-0 h-10 rounded-md border border-input bg-background/50 backdrop-blur-sm shadow-xs focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[0.5px] ${
        isMobile ? "bg-background" : ""
      }`}
    >
      <Search className="h-4 w-4 text-foreground shrink-0 ml-3 pointer-events-none" />

      {hasTagFilter && (
        <div
          ref={chipsScrollRef}
          onPointerDown={handleChipPointerDown}
          onPointerMove={handleChipPointerMove}
          onPointerUp={handleChipPointerUp}
          onPointerCancel={handleChipPointerUp}
          className={`flex items-center gap-1.5 min-w-0 flex-1 overflow-x-auto overflow-y-hidden pl-2 py-1 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isDraggingChips ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {selectedColumns.map((column) => (
            <span
              key={column.id}
              className="inline-flex items-center gap-1 shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground"
            >
              <Tag className="h-3 w-3 shrink-0 opacity-70 text-card-foreground" />
              <span className="whitespace-nowrap text-card-foreground">
                {column.title}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (dragState.current.moved) return;
                  toggleStatusFilter(column.id);
                }}
                className="rounded-full p-0.5 hover:bg-muted transition-colors text-card-foreground"
                aria-label={`Remove ${column.title} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        placeholder={hasTagFilter ? "Search..." : "Search tasks..."}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        autoFocus={!isMobile}
        className={`bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground px-2 min-w-[5.5rem] ${
          hasTagFilter ? "w-[5.5rem] shrink-0" : "flex-1 min-w-0"
        }`}
      />

      <div className="flex items-center gap-1 shrink-0 pr-2">
        <DropdownMenu open={tagMenuOpen} onOpenChange={setTagMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-1 text-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label="Filter by status"
            >
              <Tag className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => clearStatusFilter()}
              className="text-muted-foreground"
            >
              Clear all
            </DropdownMenuItem>
            {columns.map((column) => {
              const isSelected = statusFilter.includes(column.id);
              return (
                <DropdownMenuItem
                  key={column.id}
                  onSelect={(e) => {
                    e.preventDefault();
                    toggleStatusFilter(column.id);
                  }}
                >
                  <span className="flex-1">{column.title}</span>
                  {isSelected && <Check className="h-4 w-4 ml-2 shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {!isMobile && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClearAll();
            }}
            className="p-1 text-foreground hover:text-foreground transition-colors"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  // Mobile: icon trigger + popup dialog
  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="relative p-2"
          aria-label="Open search"
        >
          <Search
            className="h-5 w-5 text-foreground hover:text-foreground transition-colors"
            strokeWidth={2.5}
          />
          {hasActiveFilters && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>

        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogContent
            className="top-[18%] translate-y-0 w-[calc(100%-2rem)] max-w-md gap-4 p-4"
            showCloseButton={false}
          >
            <DialogHeader className="flex-row items-center justify-between space-y-0 text-left">
              <DialogTitle className="text-base text-left text-card-foreground font-semibold">
                Search & filter
              </DialogTitle>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md hover:bg-muted text-foreground"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>

            {searchField}

            {(hasActiveFilters || filter) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-muted-foreground hover:text-foreground self-start"
              >
                Clear filters
              </button>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop: collapsed icon or expanded inline search
  if (!isExpanded && !hasTagFilter) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="p-2 "
        aria-label="Open search"
      >
        <Search
          className="h-5 w-5 text-foreground hover:text-foreground transition-colors"
          strokeWidth={2.5}
        />
      </button>
    );
  }

  return (
    <div className="flex items-center w-full min-w-0 max-w-xs sm:max-w-sm">
      {searchField}
    </div>
  );
};
