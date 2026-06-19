import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

interface ToolLoadingOverlayProps {
  message?: string;
}

const ToolLoadingOverlay = ({ message = "Generating results, please wait…" }: ToolLoadingOverlayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-card border border-border shadow-2xl max-w-sm mx-4"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 rounded-full border-4 border-muted border-t-primary"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sparkles className="h-6 w-6 text-primary" />
          </motion.div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Processing with AI</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="h-2 w-2 rounded-full bg-primary"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ToolLoadingOverlay;
