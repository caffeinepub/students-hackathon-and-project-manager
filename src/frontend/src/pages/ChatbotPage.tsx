import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User as UserIcon, AlertCircle } from 'lucide-react';
import { useChatWithGemini } from '../hooks/useQueries';
import { normalizeError } from '../lib/errors';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
};

export default function ChatbotPage() {
  const chatWithGemini = useChatWithGemini();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I\'m your AI assistant powered by Google Gemini. I can help you with:\n\n• Finding student achievements and projects\n• Answering questions about the platform\n• Providing information about verification processes\n• General queries about student portfolios\n\nHow can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const buildContext = (): string => {
    return `You are an AI assistant for a student achievement management platform. 
The platform allows students to showcase their projects, research papers, hackathon wins, and certificates.
Professors can verify these achievements. Students can search for achievements by student ID, category, or keywords.
Be helpful, concise, and professional in your responses.`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      const context = buildContext();
      const response = await chatWithGemini.mutateAsync({
        context,
        message: userMessage,
      });

      // Parse the Gemini response to extract the answer
      let answerText = response.answer;
      
      // Try to extract text from JSON response if needed
      try {
        const jsonResponse = JSON.parse(response.answer);
        if (jsonResponse.candidates && jsonResponse.candidates[0]?.content?.parts?.[0]?.text) {
          answerText = jsonResponse.candidates[0].content.parts[0].text;
        }
      } catch {
        // If not JSON, use the raw answer
        answerText = response.answer;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answerText,
        },
      ]);
    } catch (error) {
      const errorMessage = normalizeError(error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
          error: true,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground mt-1">Powered by Google Gemini - Ask me anything about student achievements</p>
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
                        : message.error
                        ? 'bg-destructive/10 border border-destructive/20'
                        : 'bg-muted'
                    }`}
                  >
                    {message.error && (
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="text-xs font-semibold text-destructive">Error</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
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
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about student achievements..."
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
