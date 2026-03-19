import { useState, useEffect, useRef } from "react";
import { Send, Smile, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  badge?: string;
  badgeColor?: string;
  text: string;
  time: string;
}

const AVATARS = ["🎰", "🃏", "🎲", "💎", "🔥", "⚡", "🌟", "🎯", "👑", "🦊"];
const USERNAMES = ["CryptoKing", "LuckyAce", "DiamondHands", "MoonShot", "HighRoller", "NeonBet", "GoldRush", "StakeWhale", "PhantomX", "RoyalFlush"];
const BADGES = [
  { text: "VIP", color: "bg-primary text-primary-foreground" },
  { text: "MOD", color: "bg-accent text-accent-foreground" },
  { text: "OG", color: "bg-destructive text-destructive-foreground" },
  { text: undefined, color: undefined },
  { text: undefined, color: undefined },
];

const FAKE_MESSAGES = [
  "Just hit 50x on Crash! 🚀",
  "gg everyone",
  "mines is so addicting lol",
  "who else grinding dice? 🎲",
  "let's goooo huge win!!",
  "anyone on a losing streak? 😅",
  "plinko is underrated fr",
  "this site is fire 🔥",
  "just cashed out at 12x",
  "all in on mines let's go 💣",
  "rip my balance",
  "neon green theme is sick",
  "how do i get VIP?",
  "nice hit bro!",
  "1000 credits gone in 2 mins 💀",
];

const generateMessage = (): ChatMessage => {
  const user = USERNAMES[Math.floor(Math.random() * USERNAMES.length)];
  const badge = BADGES[Math.floor(Math.random() * BADGES.length)];
  return {
    id: Math.random().toString(36).slice(2),
    user,
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    badge: badge.text,
    badgeColor: badge.color,
    text: FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)],
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    Array.from({ length: 8 }, generateMessage)
  );
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => [...prev.slice(-30), generateMessage()]);
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        user: "You",
        avatar: "😎",
        badge: undefined,
        badgeColor: undefined,
        text: input.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg glow-green btn-press lg:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Desktop always-visible / Mobile toggle */}
      <AnimatePresence>
        {(isOpen || typeof window !== "undefined") && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className={`${
              isOpen ? "fixed inset-y-0 right-0 z-40 w-80" : "hidden lg:flex"
            } w-72 xl:w-80 flex-col border-l border-border bg-card h-full`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Live Chat</h3>
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground lg:hidden">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 text-sm"
                >
                  <span className="text-lg shrink-0">{msg.avatar}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {msg.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${msg.badgeColor}`}>
                          {msg.badge}
                        </span>
                      )}
                      <span className={`font-semibold ${msg.user === "You" ? "text-primary" : "text-foreground"}`}>
                        {msg.user}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-muted-foreground break-words">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9">
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Say something..."
                  className="h-9 bg-secondary text-sm"
                />
                <Button size="icon" className="shrink-0 h-9 w-9" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChat;
