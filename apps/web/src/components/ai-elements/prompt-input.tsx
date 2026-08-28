'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowUp } from 'lucide-react';

interface PromptInputProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit?: (message: { text: string }) => void;
}

const PromptInput = React.forwardRef<HTMLFormElement, PromptInputProps>(
  ({ className, onSubmit, children, ...props }, ref) => {
    const [text, setText] = React.useState('');
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (text.trim()) {
        onSubmit?.({ text: text.trim() });
        setText('');
      }
    };
    return (
      <form ref={ref} className={cn('flex flex-col gap-2 p-3', className)} onSubmit={handleSubmit} {...props}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === PromptInputTextarea) {
            return React.cloneElement(child as React.ReactElement<any>, {
              value: text,
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value),
            });
          }
          return child;
        })}
      </form>
    );
  }
);
PromptInput.displayName = 'PromptInput';

const PromptInputTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <Textarea
      ref={ref}
      className={cn('min-h-12 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0', className)}
      placeholder="Ask anything..."
      rows={1}
      {...props}
    />
  )
);
PromptInputTextarea.displayName = 'PromptInputTextarea';

function PromptInputFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between', className)}>{children}</div>;
}

function PromptInputTools({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-1', className)}>{children}</div>;
}

function PromptInputButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button type="button" variant="ghost" size="icon-sm" className={cn('rounded-md', className)} {...props}>
      {children}
    </Button>
  );
}

function PromptInputSubmit({ disabled, status, className }: { disabled?: boolean; status?: string; className?: string }) {
  return (
    <Button type="submit" size="icon-sm" disabled={disabled} className={cn('rounded-md', className)}>
      {status === 'submitted' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
    </Button>
  );
}

export { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputTools, PromptInputButton, PromptInputSubmit };
