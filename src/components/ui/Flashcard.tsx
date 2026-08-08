import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface FlashcardProps {
  front: string;
  back: string;
  className?: string;
}

export function Flashcard({ front, back, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <div
      className={cn("relative w-full max-w-md h-64 perspective-1000 cursor-pointer", className)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-background border border-border rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <p className="text-lg font-medium text-foreground">{front}</p>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full backface-hidden bg-muted border border-border rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <p className="text-lg font-medium text-foreground">{back}</p>
        </div>
      </motion.div>
    </div>
  );
}
