import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { ArrowLeft, Mail, Pencil, User, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import kanbanImg from "@/assets/kanban1.png";
import backgroundImage from "@/assets/kanban.jpg";

const Profile = () => {
  const { user, updateProfile } = useAuthStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [errors, setErrors] = useState({ name: "", email: "" });

  useEffect(() => {
    if (!isEditing) {
      setName(user?.name ?? "");
      setEmail(user?.email ?? "");
    }
  }, [user?.name, user?.email, isEditing]);

  const displayName = name.trim()
    ? name.trim().charAt(0).toUpperCase() + name.trim().slice(1)
    : "User";

  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasChanges =
    name.trim() !== (user?.name ?? "").trim() ||
    email.trim() !== (user?.email ?? "").trim();

  const resetForm = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setErrors({ name: "", email: "" });
  };

  const handleEnterEdit = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsEditing(false);
  };

  const validate = () => {
    const next = { name: "", email: "" };
    let valid = true;

    if (!name.trim()) {
      next.name = "Name is required";
      valid = false;
    }

    if (!email.trim()) {
      next.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      next.email = "Email is invalid";
      valid = false;
    }

    setErrors(next);
    return valid;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    if (!validate()) return;

    updateProfile(name, email);
    setIsEditing(false);
    toast.success("Profile updated");
  };

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
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px]" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/25 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 py-2 max-w-8xl">
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-foreground"
                onClick={() => navigate("/")}
                aria-label="Back to board"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                  Profile
                </h1>
                <div className="p-2 rounded-lg">
                  <img src={kanbanImg} alt="Kanban" className="h-6 w-6" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 pt-20 pb-12 px-4 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-lg flex flex-col"
        >
          <div className="rounded-t-xl px-4 py-3 flex items-center justify-between bg-background text-todo-foreground">
            <h2 className="font-semibold text-sm">Your profile</h2>
            {isEditing ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-white/20"
                onClick={handleCancelEdit}
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-white/20"
                onClick={handleEnterEdit}
                aria-label="Edit profile"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>

          <form
            onSubmit={handleSave}
            className="flex-1 rounded-b-xl min-h-10 bg-background p-4 pb-5 space-y-4"
          >
            <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-background border border-border text-card-foreground flex items-center justify-center text-lg font-semibold shrink-0">
                {initials || <User className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-card-foreground break-all">
                  {displayName}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  {email.trim() || "—"}
                </p>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="profile-name"
                  className="flex items-center gap-2 text-card-foreground"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  Name
                </Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={!isEditing}
                  className={`bg-card text-card-foreground border-border ${
                    !isEditing ? "cursor-default opacity-90" : ""
                  } ${errors.name ? "border-destructive" : ""}`}
                  autoComplete="name"
                />
                {isEditing && errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="profile-email"
                  className="flex items-center gap-2 text-card-foreground"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!isEditing}
                  className={`bg-card text-card-foreground border-border ${
                    !isEditing ? "cursor-default opacity-90" : ""
                  } ${errors.email ? "border-destructive" : ""}`}
                  autoComplete="email"
                />
                {isEditing && errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isEditing && (
                <Button
                  type="submit"
                  disabled={!hasChanges}
                  className="w-full bg-foreground hover:bg-card disabled:opacity-50"
                >
                  Save changes
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full text-card-foreground"
                onClick={() => navigate("/")}
              >
                Back to board
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
