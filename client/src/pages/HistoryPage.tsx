import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, ExternalLink, Calendar, FileQuestion } from "lucide-react";
import { MOCK_HISTORY, MOCK_QUIZ } from "@/lib/mockData";
import { ArticleCard } from "@/components/quiz/ArticleCard";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { format } from "date-fns";

export default function HistoryPage() {
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  
  // In a real app, we'd fetch the specific quiz details. 
  // For this mock, we'll just reuse MOCK_QUIZ if they click anything.
  const selectedQuiz = selectedQuizId ? MOCK_QUIZ : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
       <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-primary">Quiz History</h1>
        <p className="text-muted-foreground">Review your past generated quizzes and test your knowledge again.</p>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Article Title</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_HISTORY.map((quiz) => (
              <TableRow key={quiz.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {quiz.id}
                </TableCell>
                <TableCell className="font-medium text-base text-primary">
                  {quiz.title}
                  <div className="block md:hidden text-xs text-muted-foreground truncate max-w-[200px]">{quiz.url}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    <FileQuestion className="w-3 h-3 mr-1" />
                    {quiz.questionCount} Qs
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(quiz.created_at), "MMM d, yyyy")}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 hover:bg-primary hover:text-white transition-colors"
                    onClick={() => setSelectedQuizId(quiz.id)}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedQuizId} onOpenChange={(open) => !open && setSelectedQuizId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-2 bg-white z-10 border-b">
             <DialogTitle className="text-2xl font-serif">Quiz Details</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-6 bg-secondary/10">
            {selectedQuiz && (
              <div className="space-y-8 pb-10">
                <ArticleCard 
                  title={selectedQuiz.title}
                  summary={selectedQuiz.summary}
                  url={selectedQuiz.url}
                  entities={selectedQuiz.entities}
                  relatedTopics={selectedQuiz.relatedTopics}
                />
                <div className="space-y-6">
                  <h3 className="text-xl font-serif font-bold text-primary border-b pb-2">Questions</h3>
                  {selectedQuiz.questions.map((q, i) => (
                    <QuizQuestion 
                      key={q.id}
                      index={i}
                      {...q}
                    />
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
