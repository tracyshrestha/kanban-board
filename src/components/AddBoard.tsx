import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface AddBoardProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const AddBoard = ({ onSave, onCancel }: AddBoardProps) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when component mounts
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="min-w-[280px] rounded-xl border-2  border-muted-foreground/30 bg-background p-4">
      <div className="space-y-3">
        <Input
          ref={inputRef}
          placeholder="Enter list name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-card text-primary-foreground"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            size="sm"
            className="p-4.5"
          >
            Add List
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className=" text-primary-foreground"
          >
           X
          </Button>
        </div>
      </div>
    </div>
  );
};

