import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface GameCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
  provider?: string;
  thumbnail?: string;
  index?: number;
}

const GameCard = ({ name, description, icon: Icon, path, color, provider = "NeoVegas Originals", index = 0 }: GameCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className="group relative overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary/40"
    >
      {/* Thumbnail area */}
      <div className={`relative h-32 flex items-center justify-center ${color} overflow-hidden`}>
        <Icon className="h-12 w-12 opacity-60 group-hover:opacity-90 transition-opacity" />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-bold text-sm text-card-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">{provider}</p>
      </div>

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground glow-green">
          Play Now
        </span>
      </motion.div>
    </motion.button>
  );
};

export default GameCard;
