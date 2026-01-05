import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Wand2, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ArticleCard } from "@/components/quiz/ArticleCard";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { MOCK_QUIZ } from "@/lib/mockData";

const formSchema = z.object({
  url: z.string().url("Please enter a valid URL").regex(/wikipedia\.org\/wiki\//, "Must be a Wikipedia article URL"),
});

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<typeof MOCK_QUIZ | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setQuizData(null); // Reset

    // Extract a title from the URL for the mock data
    const urlParts = values.url.split("/wiki/");
    const rawTitle = urlParts.length > 1 ? urlParts[1].replace(/_/g, " ") : "Generated Article";
    const decodedTitle = decodeURIComponent(rawTitle);

    // Simulate API call with dynamic-ish mock data based on input
    setTimeout(() => {
      setIsLoading(false);
      
      // Update mock data to reflect the specific URL
      const dynamicQuiz = {
        ...MOCK_QUIZ,
        title: decodedTitle,
        url: values.url,
        summary: decodedTitle === "Alan Turing" 
          ? MOCK_QUIZ.summary 
          : `This article discusses ${decodedTitle}, a significant subject in its field. The content covers historical context, key developments, and the lasting impact of ${decodedTitle} on modern society and academic study.`,
        entities: decodedTitle === "Alan Turing" 
          ? MOCK_QUIZ.entities 
          : [decodedTitle, "Historical Context", "Major Impact", "Future Research", "Key figures"],
        // Generate dynamic questions based on the title
        questions: decodedTitle === "Alan Turing" 
          ? MOCK_QUIZ.questions 
          : MOCK_QUIZ.questions.map((q, i) => ({
              ...q,
              question: q.question.replace(/Turing|Bletchley Park|Enigma|Alan Turing/g, decodedTitle),
              options: q.options.map(opt => opt.replace(/Turing|Bletchley Park|Enigma|Alan Turing/g, decodedTitle)),
              correct: q.correct.replace(/Turing|Bletchley Park|Enigma|Alan Turing/g, decodedTitle),
              explanation: q.explanation.replace(/Turing|Bletchley Park|Enigma|Alan Turing/g, decodedTitle)
            }))
      };

      setQuizData(dynamicQuiz);
      toast({
        title: "Quiz Generated Successfully",
        description: `Generated ${MOCK_QUIZ.questions.length} questions for "${decodedTitle}"`,
      });
    }, 2000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-tight">
          Turn Knowledge into <span className="text-blue-600">Mastery</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Enter any Wikipedia article URL to instantly generate an interactive quiz using advanced AI analysis.
        </p>
      </div>

      <div className="bg-white p-2 rounded-xl shadow-lg border border-border/50 max-w-2xl mx-auto transform transition-all hover:shadow-xl hover:scale-[1.01]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 relative">
            <div className="absolute left-3 top-3 text-muted-foreground pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="https://en.wikipedia.org/wiki/..." 
                      className="pl-10 h-12 border-0 shadow-none focus-visible:ring-0 text-base" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="absolute -bottom-6 left-2" />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="h-12 px-8 font-medium bg-primary hover:bg-primary/90 transition-colors" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 animate-pulse">
           <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
             <Loader2 className="w-8 h-8 text-primary animate-spin" />
           </div>
           <p className="text-muted-foreground font-medium">Reading article, analyzing entities, constructing questions...</p>
        </div>
      )}

      {quizData && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <ArticleCard 
            title={quizData.title}
            summary={quizData.summary}
            url={quizData.url}
            entities={quizData.entities}
            relatedTopics={quizData.relatedTopics}
          />
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="h-px bg-border flex-1"></div>
               <h2 className="text-2xl font-serif font-bold text-center text-primary">Knowledge Check</h2>
               <div className="h-px bg-border flex-1"></div>
            </div>
            
            <div className="grid gap-6">
              {quizData.questions.map((q, i) => (
                <QuizQuestion 
                  key={q.id}
                  index={i}
                  {...q}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <Button variant="outline" size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Generate Another Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
