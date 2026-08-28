'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from?: 'user' | 'assistant';
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, from, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex gap-3',
        from === 'user' ? 'flex-row-reverse' : 'flex-row',
        className
      )}
      {...props}
    >
      {from === 'assistant' && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">AI</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('max-w-[80%]', from === 'user' ? 'text-right' : 'text-left')}>
        {children}
      </div>
    </div>
  )
);
Message.displayName = 'Message';

const MessageContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm', className)} {...props}>
      {children}
    </div>
  )
);
MessageContent.displayName = 'MessageContent';

function MessageResponse({ children }: { children: React.ReactNode }) {
  return <div className="prose prose-sm dark:prose-invert max-w-none">{children}</div>;
}

export { Message, MessageContent, MessageResponse };
