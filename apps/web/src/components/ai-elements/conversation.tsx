'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const Conversation = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('relative flex-1 overflow-hidden', className)} {...props}>
      {children}
    </div>
  )
);
Conversation.displayName = 'Conversation';

const ConversationContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <ScrollArea className="h-full">
      <div ref={ref} className={cn('flex flex-col gap-6 p-4', className)} {...props}>
        {children}
      </div>
    </ScrollArea>
  )
);
ConversationContent.displayName = 'ConversationContent';

function ConversationScrollButton({ className }: { className?: string }) {
  return null;
}

export { Conversation, ConversationContent, ConversationScrollButton };
