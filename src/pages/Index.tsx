import { useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { FilterBar } from "@/components/FilterBar";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import kanbanImg from "@/assets/kanban1.png";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import backgroundImage from "@/assets/kanban.jpg";

const Index = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px]"></div>

      {/* Fixed Navbar with blur effect */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/25 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 py-2 max-w-8xl">
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {user?.name
                    ? user.name.charAt(0).toUpperCase() +
                      user.name.slice(1) +
                      "'s Board"
                    : "Kanban Board"}
                </h1>
              </div>
              <div className="p-2  rounded-lg">
                <img
                  src={kanbanImg}
                  alt="Kanban"
                  className="h-6 w-6 "
                />
              </div>
            </div>
            <div className="flex gap-2">
              <FilterBar />
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content with padding to account for fixed navbar */}
      <div className="relative z-10 pt-8">
        <div className="container mx-auto px-4 py-8 pt-14 max-w-7xl">
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
