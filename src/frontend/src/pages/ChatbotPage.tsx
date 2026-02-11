import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { parsePrompt } from '../lib/chatbotParser';
import { executeChatbotSearch } from '../lib/chatbotSearch';
import { useActor } from '../hooks/useActor';
import { useGetAllProfiles } from '../hooks/useQueries';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  achievements?: any[];
};

export default function ChatbotPage() {
  const { actor } = useActor();
  const { data: profiles = [] } = useGetAllProfiles();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I can help you find student achievements. Try asking me:\n\n• "Show projects for student STU12345"\n• "Find hackathon wins in 2024"\n• "Search for machine learning projects"\n• "Show all verified certificates"',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const studentNames = new Map(profiles.map((p) => [p.studentId || '', p.name]));

  const handleSend = async () => {
    if (!input.trim() || !actor) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      // Parse the prompt
      const parseResult = parsePrompt(userMessage);

      if (parseResult.type === 'clarification') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: parseResult.message,
          },
        ]);
      } else {
        // Execute search
        const searchResult = await executeChatbotSearch(actor, parseResult.filters);

        let responseContent = `I found ${searchResult.achievements.length} achievement(s) matching your query.\n\n`;
        responseContent += `**Filters applied:**\n`;
        if (parseResult.filters.studentId) {
          responseContent += `• Student ID: ${parseResult.filters.studentId}\n`;
        }
        if (parseResult.filters.category) {
          responseContent += `• Category: ${parseResult.filters.category}\n`;
        }
        if (parseResult.filters.textTerms.length > 0) {
          responseContent += `• Keywords: ${parseResult.filters.textTerms.join(', ')}\n`;
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: responseContent,
            achievements: searchResult.achievements,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground mt-1">Ask questions about student achievements</p>
      </div>

      <Card className="h-[calc(100vh-16rem)]">
        <CardContent className="p-0 h-full flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-4 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    {message.achievements && message.achievements.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {message.achievements.map((achievement, i) => (
                          <div key={i} className="bg-card p-3 rounded border text-card-foreground">
                            <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {achievement.description}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {achievement.category}
                              </span>
                              <span className="text-muted-foreground">
                                {studentNames.get(achievement.studentId) || 'Student'} ({achievement.studentId})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-5 w-5 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about student achievements..."
                disabled={isProcessing}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isProcessing}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

