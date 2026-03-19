import { motion } from "framer-motion";
import { Construction } from "lucide-react";

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-10 text-center max-w-md"
    >
      <Construction className="h-12 w-12 text-primary mx-auto mb-4" />
      <h1 className="text-2xl font-extrabold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground">This section is coming soon. Stay tuned for updates!</p>
    </motion.div>
  </div>
);

export default PlaceholderPage;
