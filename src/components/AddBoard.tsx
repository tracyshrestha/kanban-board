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
    <div className="min-w-[280px] rounded-lg border-2  border-muted-foreground/30 bg-muted/30 p-4">
      <div className="space-y-3">
        <Input
          ref={inputRef}
          placeholder="Enter board name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            size="sm"
            className="flex-1"
          >
            Save
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

