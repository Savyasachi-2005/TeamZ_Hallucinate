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
          content: 'I\'m having trouble connecting right now. Please try again in a moment.',
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
      i % 2 === 0 ? part : <strong key={i} className="font-black text-slate-900">{part}</strong>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors"
          aria-label="Open AI Copilot"
        >
          <Brain className="w-7 h-7" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] bg-white rounded-xl shadow-xl border-2 border-slate-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">AI Growth Copilot</h3>
                <p className="text-xs text-slate-600 font-bold">Context-aware insights</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
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
                  className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-semibold">
                    {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                  </p>
                  {message.source && message.source !== 'system' && (
                    <div className="mt-2 pt-2 border-t-2 border-slate-200">
                      <span className="text-xs text-slate-600 flex items-center gap-1 font-bold">
                        {message.source === 'rule_based' ? (
                          <>
                            <Brain className="w-3 h-3" />
                            Instant answer
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            AI-powered
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
                <div className="max-w-[85%] rounded-xl px-4 py-3 bg-white border-2 border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-xs text-slate-600 font-bold">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t-2 border-slate-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your growth..."
                className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-200 bg-white 
                  focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                  text-sm text-slate-900 font-semibold placeholder:text-slate-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
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
