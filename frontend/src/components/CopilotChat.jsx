import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Brain, Loader2 } from 'lucide-react';
import { copilotChat } from '@/services/api';
import { toast } from 'sonner';

const CopilotChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am your AI Growth Copilot. Ask me about channel performance, engagement strategies, or trending opportunities.',
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
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await copilotChat(userMessage);
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
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I am having trouble connecting. Please try again in a moment.',
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
    return content.split('**').map((part, i) => 
      i % 2 === 0 ? part : <strong key={i} className="font-bold text-slate-900">{part}</strong>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open AI Copilot"
        >
          <Brain className="w-7 h-7 transition-transform group-hover:rotate-12" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-slate-200 flex flex-col animate-slide-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Copilot</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-slate-600 font-semibold">Online</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-50">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                  </p>
                  {message.source && message.source !== 'system' && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                        {message.source === 'rule_based' ? (
                          <>
                            <Brain className="w-3 h-3" />
                            Instant
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            AI
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
                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white border-2 border-slate-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="text-sm text-slate-600 font-medium">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t-2 border-slate-100 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your growth..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  text-sm text-slate-900 font-medium placeholder:text-slate-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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
", "path": "/app/frontend/src/components/CopilotChat.jsx"}, {"content": "import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
      </div>
      <p className="mt-6 text-slate-700 font-semibold text-lg">{message}</p>
      <p className="mt-2 text-slate-500 text-sm">AI is analyzing data...</p>
    </div>
  );
};

export default LoadingSpinner;
", "path": "/app/frontend/src/components/LoadingSpinner.jsx"}]