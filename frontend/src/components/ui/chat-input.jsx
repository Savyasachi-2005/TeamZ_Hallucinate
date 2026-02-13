import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const ChatInput = React.forwardRef(({ className, ...props }, ref) => (
  <Textarea
    autoComplete="off"
    ref={ref}
    name="message"
    className={cn(
      "max-h-12 px-4 py-3 bg-white text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none",
      className
    )}
    {...props}
  />
));
ChatInput.displayName = "ChatInput";

export { ChatInput };