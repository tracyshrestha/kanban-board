import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import kanbanImg from '@/assets/kanban1.png';
import trello from '@/assets/Trello.png';
import trelloDark from '@/assets/TrelloDark.png';

interface AuthShellProps {
  description: string;
  children: ReactNode;
}

export function AuthShell({ description, children }: AuthShellProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  const bgImage = theme === 'dark' ? trelloDark : trello;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Card className="w-full lg:min-w-md min-w-sm bg-background backdrop-blur-sm py-16">
          <CardHeader className="space-y-1 justify-center">
            <div className="flex">
              <img
                src={kanbanImg}
                alt="Kanban"
                className="h-10 w-10 text-primary-foreground"
              />
              <CardTitle className="text-4xl text-center">Trello</CardTitle>
            </div>
            <CardDescription className="text-center text-lg font-bold">
              {description}
            </CardDescription>
          </CardHeader>
          {children}
        </Card>
      </motion.div>
    </div>
  );
}
