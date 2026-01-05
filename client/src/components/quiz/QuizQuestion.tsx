import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionProps {
  id: number;
  question: string;
  options: string[];
  correct: string;
  difficulty: string;
  explanation: string;
  index: number;
}

export function QuizQuestion({ question, options, correct, difficulty, explanation, index }: QuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const isCorrect = selected === correct;
  const hasAnswered = selected !== null;

  const difficultyColor = {
    easy: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    hard: "bg-red-100 text-red-700 border-red-200"
  }[difficulty.toLowerCase()] || "bg-gray-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className={cn(
        "transition-all duration-300 border-l-4",
        hasAnswered 
          ? isCorrect ? "border-l-green-500 shadow-md" : "border-l-red-500 shadow-md"
          : "border-l-primary/20 hover:border-l-primary hover:shadow-lg"
      )}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Question {index + 1}</span>
            <Badge variant="outline" className={cn("capitalize", difficultyColor)}>
              {difficulty}
            </Badge>
          </div>
          <CardTitle className="text-lg font-medium leading-snug">{question}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4">
          {options.map((option, i) => {
            let variant = "outline";
            let className = "justify-start text-left h-auto py-3 px-4 hover:bg-secondary/50 relative overflow-hidden";
            
            if (hasAnswered) {
              if (option === correct) {
                className += " bg-green-50 text-green-900 border-green-200 hover:bg-green-50";
                // variant = "default"; // Custom styling instead
              } else if (option === selected) {
                className += " bg-red-50 text-red-900 border-red-200 hover:bg-red-50";
              } else {
                className += " opacity-50";
              }
            } else if (selected === option) {
               className += " border-primary bg-primary/5";
            }

            return (
              <Button
                key={i}
                variant="outline"
                className={className}
                onClick={() => !hasAnswered && setSelected(option)}
                disabled={hasAnswered}
              >
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs mr-3 opacity-50 shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
                {hasAnswered && option === correct && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 ml-2" />
                )}
                {hasAnswered && option === selected && option !== correct && (
                  <XCircle className="w-5 h-5 text-red-500 ml-2" />
                )}
              </Button>
            );
          })}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch pt-0 pb-4">
          <AnimatePresence>
            {hasAnswered && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden w-full"
              >
                 <div className="mt-2 rounded-lg bg-muted/50 p-4 text-sm border border-border/50">
                    <button 
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="flex items-center gap-2 text-primary font-medium mb-1 hover:underline text-left w-full"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Explanation
                      {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    
                    <AnimatePresence>
                      {(showExplanation || true) && ( // Always show for now, design choice
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-muted-foreground mt-2 leading-relaxed"
                        >
                          {explanation}
                        </motion.p>
                      )}
                    </AnimatePresence>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
