'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputTools, PromptInputButton, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { Paperclip, Zap, MessageCircle, Settings, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: '**Welcome to Uni-Edge Assistant.** I can help you with:\n\n- Student enrollment and admissions queries\n- Exam scheduling and proctoring status\n- Fee collection and payment verification\n- Attendance reports and analytics\n- Institution settings and configuration\n\nAsk me anything about your institution\'s operations.',
  },
];

const RESPONSES = [
  'Here\'s what I found:\n\n1. **Active Students**: 195 across 12 programs\n2. **Pending Applications**: 88 awaiting review\n3. **Upcoming Exams**: 3 scheduled this week\n\nWould you like me to drill down into any of these areas?',
  'For fee collection, the current status shows:\n- **Total Billed**: ₹12,50,000\n- **Collected**: ₹8,75,000 (70%)\n- **Pending**: ₹3,75,000 across 45 invoices\n\nThe SBI Collect integration is active for online payments.',
  'Proctoring overview:\n- **Live Sessions**: 2 currently in progress\n- **Flagged Events**: 12 total (8 auto-cleared, 4 pending review)\n- **Completed Today**: 15 sessions\n\nAll proctors are assigned and online.',
  'Attendance summary for this week:\n- **Monday**: 92% average\n- **Tuesday**: 88% average\n- **Wednesday**: 95% average\n- **Low attendance alerts**: 3 students flagged\n\nWould you like to see the detailed report?',
  'Based on the current admission cycle:\n- **Merit List**: Generated for B.Tech Computer Science\n- **Cut-off**: General: 85%, OBC: 75%, SC/ST: 65%\n- **Seats Remaining**: 12 out of 60\n\nThe next merit list update is scheduled for Friday.',
];

const ACTIONS = [
  { id: 'enrollment', icon: Zap, label: 'Enrollment Stats' },
  { id: 'exams', icon: Settings, label: 'Exam Status' },
  { id: 'fees', icon: Send, label: 'Fee Overview' },
];

export default function AdminAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'ready' | 'submitted'>('ready');
  const bottomRef = useRef<HTMLDivElement>(null);
  const responseIndex = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setStatus('submitted');

    setTimeout(() => {
      const response: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: RESPONSES[responseIndex.current % RESPONSES.length],
      };
      setMessages(prev => [...prev, response]);
      setStatus('ready');
      responseIndex.current++;
    }, 900);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
        <Card className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border/80 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-sm font-semibold">Uni-Edge Assistant</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Online
                  </span>
                  <span className="hidden sm:inline">- AI-Powered Support</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8" title="Settings">
                <Settings className="size-4" />
              </Button>
            </div>
          </div>

          <Conversation className="bg-muted/30 flex-1">
            <ConversationContent className="gap-6 pl-1">
              {messages.map(message => (
                <Message from={message.role} key={message.id}>
                  <MessageContent className={message.role === 'assistant' ? 'max-w-prose' : ''}>
                    {message.role === 'assistant' ? (
                      <MessageResponse>{message.content}</MessageResponse>
                    ) : (
                      <p className="whitespace-pre-wrap text-pretty">{message.content}</p>
                    )}
                  </MessageContent>
                </Message>
              ))}
              <div ref={bottomRef} />
            </ConversationContent>
          </Conversation>

          <div className="bg-background border-t">
            <PromptInput onSubmit={({ text }) => handleSend(text)}>
              <PromptInputTextarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your institution..."
              />
              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputButton aria-label="Attach"><Paperclip className="size-4" /></PromptInputButton>
                  <PromptInputButton aria-label="Quick prompt"><Zap className="size-4" /></PromptInputButton>
                  <PromptInputButton aria-label="New chat"><MessageCircle className="size-4" /></PromptInputButton>
                </PromptInputTools>
                <PromptInputSubmit disabled={!inputValue.trim() || status !== 'ready'} status={status} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </Card>

        <div className="flex min-h-0 max-w-250 shrink-0 flex-wrap items-center justify-center gap-3 mt-3">
          {ACTIONS.map(action => (
            <Button key={action.id} variant="outline" size="sm" className="gap-2 rounded-full" onClick={() => handleSend(action.label)}>
              <action.icon size={16} />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
