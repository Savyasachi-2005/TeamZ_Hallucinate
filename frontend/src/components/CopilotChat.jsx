import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Brain } from 'lucide-react';
import { copilotChat } from '@/services/api';
import { toast } from 'sonner';

const CopilotChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI Growth Copilot. Ask me about your channel performance, engagement, growth strategies, or trending opportunities.',
      source: 'system'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await copilotChat(userMessage);
      
      // Add assistant response
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
          source: response.source,
          contextUsed: response.context_used
        }
      ]);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          source: 'error'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (content) => {
    // Convert **text** to bold
    return content.split('**').map((part, i) => 
      i % 2 === 0 ? part : <strong key={i} className="font-bold text-[#0F172A]">{part}</strong>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#10B981] 
            hover:from-[#3B82F6]/90 hover:to-[#10B981]/90 text-white shadow-2xl hover:scale-110 
            transition-all duration-300 group"
          aria-label="Open AI Copilot"
        >
          <div className="relative">
            <Brain className="w-7 h-7" />
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-gradient-to-r from-[#3B82F6]/5 to-[#10B981]/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#10B981]">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0F172A]">AI Growth Copilot</h3>
                <p className="text-xs text-[#64748B] font-bold">Context-aware insights</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#64748B]" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white'
                      : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155]'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                  </p>
                  {message.source && message.source !== 'system' && (
                    <div className="mt-2 pt-2 border-t border-[#E2E8F0]/50">
                      <span className="text-xs text-[#64748B] flex items-center gap-1">
                        {message.source === 'rule_based' ? (
                          <>
                            <Brain className="w-3 h-3" />
                            Instant answer
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            AI-generated
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-[#64748B]">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your growth..."
                className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white 
                  focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent
                  text-sm text-[#0F172A] placeholder:text-[#94A3B8]"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#10B981] 
                  hover:from-[#3B82F6]/90 hover:to-[#10B981]/90 text-white
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CopilotChat;
