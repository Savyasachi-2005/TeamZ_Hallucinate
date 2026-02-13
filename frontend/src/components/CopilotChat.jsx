import { useState, FormEvent } from "react";
import { Send, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { copilotChat } from "@/services/api";
import { toast } from "sonner";

const CopilotChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hi! I am your AI Growth Copilot. Ask me about channel performance, engagement strategies, or trending opportunities.",
      sender: "ai",
      source: "system"
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: userMessage,
        sender: "user",
      },
    ]);
    setIsLoading(true);

    try {
      const response = await copilotChat(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: response.response,
          sender: "ai",
          source: response.source,
          contextUsed: response.context_used
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: "I am having trouble connecting. Please try again in a moment.",
          sender: "ai",
          source: "error"
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content) => {
    return content.split("**").map((part, i) =>
      i % 2 === 0 ? part : <strong key={i} className="font-bold">{part}</strong>
    );
  };

  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      icon={<Bot className="h-6 w-6" />}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center">
        <div className="flex items-center gap-2 justify-center">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900">AI Copilot</h1>
        </div>
        <div className="flex items-center gap-2 justify-center mt-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-slate-600 font-semibold">
            Context-aware growth insights
          </p>
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={
                  message.sender === "user"
                    ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&q=80&crop=faces&fit=crop"
                    : undefined
                }
                fallback={message.sender === "user" ? "YOU" : "AI"}
              />
              <div className="flex flex-col gap-1">
                <ChatBubbleMessage
                  variant={message.sender === "user" ? "sent" : "received"}
                >
                  {message.sender === "ai" ? (
                    <div className="text-sm leading-relaxed">
                      {formatMessage(message.content)}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed">{message.content}</div>
                  )}
                </ChatBubbleMessage>
                {message.source && message.source !== "system" && message.source !== "error" && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 ml-1">
                    {message.source === "rule_based" ? (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Instant answer</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3" />
                        <span>AI-powered</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </ChatBubble>
          ))}

          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                fallback="AI"
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border-2 border-slate-200 bg-white focus-within:ring-2 focus-within:ring-indigo-500 p-1"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your growth strategy..."
            className="min-h-12 resize-none rounded-lg bg-white border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0 justify-end">
            <Button type="submit" size="sm" className="ml-auto gap-1.5" disabled={!input.trim() || isLoading}>
              <span>Send</span>
              <Send className="size-3.5" />
            </Button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
};

export default CopilotChat;
