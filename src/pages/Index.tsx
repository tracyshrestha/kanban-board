import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KanbanBoard } from '@/components/KanbanBoard';
import { FilterBar } from '@/components/FilterBar';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import backgroundImage from '@/assets/kanban.jpg';

const Index = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px]"></div>
      
      {/* Fixed Navbar with blur effect */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/15 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 py-2 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                   {user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) + "'s Board" : 'Kanban Board'}
                </h1>
              </div>
              <div className="p-2 bg-primary rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>

            <div className="flex gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content with padding to account for fixed navbar */}
      <div className="relative z-10 pt-10">
        <div className="container mx-auto px-4 py-8 pt-14 max-w-7xl">
          <FilterBar />
          
          <KanbanBoard />
        </div>
      </div>

      <AddTaskDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />
    </div>
  );
};

export default Index;
