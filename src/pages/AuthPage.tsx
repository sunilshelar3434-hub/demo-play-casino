import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Coins, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({ title: "Welcome back!", description: "You're now logged in." });
      } else {
        await signUp(email, password, username);
        toast({ title: "Account created!", description: "Check your email to confirm your account." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-8"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Coins className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-extrabold text-foreground">NeoVegas</span>
        </div>

        <div className="flex rounded-lg bg-secondary p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${!isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="pl-9 bg-secondary" required={!isLogin} />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="pl-9 bg-secondary" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="pl-9 bg-secondary" required minLength={6} />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Demo platform — no real money involved
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
