import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Hash, BookOpen } from "lucide-react";

interface ArticleCardProps {
  title: string;
  summary: string;
  url: string;
  entities: string[];
  relatedTopics: string[];
}

export function ArticleCard({ title, summary, url, entities, relatedTopics }: ArticleCardProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-t-4 border-t-primary shadow-md overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-secondary/30 pb-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-3xl font-serif text-primary mb-2">{title}</CardTitle>
              <a 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {url}
              </a>
            </div>
            <div className="hidden sm:block">
              <BookOpen className="w-8 h-8 text-primary/20" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-lg leading-relaxed text-foreground/80 font-sans">{summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/50 border-dashed shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Hash className="w-4 h-4" /> Key Entities
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {entities.map((entity, i) => (
              <Badge key={i} variant="secondary" className="bg-secondary/50 hover:bg-secondary text-primary border-primary/10">
                {entity}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/50 border-dashed shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Related Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {relatedTopics.map((topic, i) => (
              <Badge key={i} variant="outline" className="hover:bg-accent cursor-pointer transition-colors">
                {topic}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
