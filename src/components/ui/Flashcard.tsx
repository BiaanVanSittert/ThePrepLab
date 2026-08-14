import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface FlashcardProps {
  front: string;
  back: string;
  className?: string;
  isFlipped?: boolean;
  onFlip?: () => void;
}

export function Flashcard({ front, back, className, isFlipped: controlledFlipped, onFlip }: FlashcardProps) {
  const [internalFlipped, setInternalFlipped] = React.useState(false);

  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const handleClick = () => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalFlipped(!internalFlipped);
    }
  };

  return (
    <div
      className={cn("relative w-full max-w-md h-64 perspective-1000 cursor-pointer select-none", className)}
      onClick={handleClick}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-card border border-border rounded-2xl shadow-md hover:shadow-lg transition-shadow p-8 flex flex-col items-center justify-center text-center">
          <span className="absolute top-4 left-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md">
            Front
          </span>
          <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">{front}</p>
          <span className="absolute bottom-4 text-xs text-muted-foreground/80 flex items-center gap-1">
            Click or press Space to flip
          </span>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full backface-hidden bg-muted/40 border border-primary/20 rounded-2xl shadow-md hover:shadow-lg transition-shadow p-8 flex flex-col items-center justify-center text-center"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <span className="absolute top-4 left-4 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            Back / Answer
          </span>
          <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">{back}</p>
          <span className="absolute bottom-4 text-xs text-muted-foreground/80 flex items-center gap-1">
            Rate your recall below
          </span>
        </div>
      </motion.div>
    </div>
  );
}
