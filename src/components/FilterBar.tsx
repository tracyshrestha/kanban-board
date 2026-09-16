import { Search, Tag, X, Check, Mic } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { useBoardStore } from "@/store/useBoardStore";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { toast } from "sonner";

/** Minimal typings for the browser STT API (Chrome / Edge / Safari variants). */
type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike> & {
    length: number;
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((ev: Event) => void) | null;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: ((ev: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const getSpeechRecognition = (): SpeechRecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

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
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseFilterRef = useRef("");
  const intentionalStopRef = useRef(false);
  const sessionActiveRef = useRef(false);
  const maxListenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const MAX_LISTEN_MS = 30_000;
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

  const clearMaxListenTimer = useCallback(() => {
    if (maxListenTimeoutRef.current) {
      clearTimeout(maxListenTimeoutRef.current);
      maxListenTimeoutRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    intentionalStopRef.current = true;
    sessionActiveRef.current = false;
    clearMaxListenTimer();

    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, [clearMaxListenTimer]);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
      toast.error("Speech-to-text is not supported in this browser");
      return;
    }

    // Stop any previous session
    if (recognitionRef.current) {
      intentionalStopRef.current = true;
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    clearMaxListenTimer();

    intentionalStopRef.current = false;
    sessionActiveRef.current = true;
    baseFilterRef.current = filter.trim();

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interim = "";

      for (let i = 0; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalText += piece;
        } else {
          interim += piece;
        }
      }

      const spoken = `${finalText}${interim}`.trim();
      if (!spoken) return;

      setFilter(
        [baseFilterRef.current, spoken].filter(Boolean).join(" ")
      );
    };

    recognition.onerror = (event) => {
      // Stay listening through silence / network blips; only abort on real failures
      if (event.error === "not-allowed") {
        sessionActiveRef.current = false;
        clearMaxListenTimer();
        setIsListening(false);
        toast.error("Microphone permission denied");
        return;
      }

      if (
        event.error === "aborted" ||
        event.error === "no-speech" ||
        event.error === "audio-capture"
      ) {
        return;
      }

      // Fatal-ish errors: end the session
      sessionActiveRef.current = false;
      clearMaxListenTimer();
      setIsListening(false);
      toast.error("Could not recognize speech");
    };

    recognition.onend = () => {
      // Keep listening until user clicks green mic or 30s cap hits
      if (sessionActiveRef.current && !intentionalStopRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // Fall through and stop if we cannot restart
        }
      }

      sessionActiveRef.current = false;
      setIsListening(false);
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    // Hard stop after 30 seconds
    maxListenTimeoutRef.current = setTimeout(() => {
      if (sessionActiveRef.current) {
        stopListening();
      }
    }, MAX_LISTEN_MS);

    try {
      recognition.start();
    } catch {
      toast.error("Could not start speech recognition");
      sessionActiveRef.current = false;
      clearMaxListenTimer();
      setIsListening(false);
    }
  }, [filter, setFilter, clearMaxListenTimer, stopListening]);

  const toggleListening = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Detect STT support once
  useEffect(() => {
    setSpeechSupported(!!getSpeechRecognition());
  }, []);

  // Cleanup recognition + timer on unmount
  useEffect(() => {
    return () => {
      sessionActiveRef.current = false;
      intentionalStopRef.current = true;
      clearMaxListenTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [clearMaxListenTimer]);

  useEffect(() => {
    if (!mobileOpen && isMobile && isListening) {
      stopListening();
    }
  }, [mobileOpen, isMobile, isListening, stopListening]);

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
    stopListening();
    setFilter("");
    clearStatusFilter();
    setTagMenuOpen(false);
    setIsExpanded(false);
    setMobileOpen(false);
  };

  const searchField = (
    <div
      className={`flex items-center w-full min-w-0 h-10 rounded-md border bg-background/50 backdrop-blur-sm shadow-xs focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[0.5px] transition-colors ${
        isMobile ? "bg-background" : ""
      } ${
        isListening
          ? "border-green-500/70 ring-2 ring-green-500/25 bg-green-500/5"
          : "border-input"
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
        placeholder={
          isListening
            ? "Listening..."
            : hasTagFilter
              ? "Search..."
              : "Search tasks..."
        }
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        autoFocus={!isMobile}
        className={`bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground px-2 min-w-[5.5rem] ${
          hasTagFilter ? "w-[5.5rem] shrink-0" : "flex-1 min-w-0"
        } ${isListening ? "placeholder:text-green-400 dark:placeholder:text-green-800" : ""}`}
      />

      <div className="flex items-center gap-1 shrink-0 pr-2">
        {speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            className={`relative flex items-center justify-center h-7 w-7 rounded-full transition-all ${
              isListening
                ? "bg-green-500 text-white shadow-md shadow-green-500/40 scale-105"
                : "text-foreground hover:bg-muted"
            }`}
            aria-label={
              isListening ? "Stop speech-to-text" : "Start speech-to-text"
            }
            aria-pressed={isListening}
            title={
              isListening
                ? "Stop listening"
                : "Speak to search (speech-to-text)"
            }
          >
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-green-400/50 animate-ping" />
                <span className="absolute -inset-0.5 rounded-full border-2 border-green-400/80 animate-pulse" />
              </>
            )}
            <Mic className={`relative ${isListening ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
          </button>
        )}

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

        <Dialog
          open={mobileOpen}
          onOpenChange={(open) => {
            if (!open) stopListening();
            setMobileOpen(open);
          }}
        >
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
                onClick={() => {
                  stopListening();
                  setMobileOpen(false);
                }}
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
