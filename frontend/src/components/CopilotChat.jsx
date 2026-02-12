import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Brain, Loader2 } from 'lucide-react';
import { copilotChat } from '@/services/api';
import { toast } from 'sonner';

const CopilotChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI Growth Copilot. Ask me about channel performance, engagement strategies, or trending opportunities.',
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
          content: 'I\'m having trouble connecting. Please try again in a moment.',
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
      i % 2 === 0 ? part : <strong key={i} className=\"font-bold text-slate-900\">{part}</strong>
    );
  };

  return (
    <>\n      {/* Floating Chat Button */}\n      {!isOpen && (\n        <button\n          onClick={() => setIsOpen(true)}\n          className=\"fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group\"\n          aria-label=\"Open AI Copilot\"\n        >\n          <Brain className=\"w-7 h-7 transition-transform group-hover:rotate-12\" />\n          <div className=\"absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse\"></div>\n        </button>\n      )}\n\n      {/* Chat Panel */}\n      {isOpen && (\n        <div className=\"fixed bottom-6 right-6 z-50 w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-slate-200 flex flex-col animate-slide-in-up\">\n          {/* Header */}\n          <div className=\"flex items-center justify-between px-6 py-4 border-b-2 border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50\">\n            <div className=\"flex items-center gap-3\">\n              <div className=\"p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500\">\n                <Sparkles className=\"w-5 h-5 text-white\" />\n              </div>\n              <div>\n                <h3 className=\"text-lg font-bold text-slate-900\">AI Copilot</h3>\n                <div className=\"flex items-center gap-2\">\n                  <div className=\"w-2 h-2 bg-emerald-500 rounded-full animate-pulse\"></div>\n                  <p className=\"text-xs text-slate-600 font-semibold\">Online</p>\n                </div>\n              </div>\n            </div>\n            <button\n              onClick={() => setIsOpen(false)}\n              className=\"p-2 hover:bg-white rounded-lg transition-colors\"\n            >\n              <X className=\"w-5 h-5 text-slate-600\" />\n            </button>\n          </div>\n\n          {/* Messages */}\n          <div className=\"flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-50\">\n            {messages.map((message, idx) => (\n              <div\n                key={idx}\n                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}\n              >\n                <div\n                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${\n                    message.role === 'user'\n                      ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white'\n                      : 'bg-white border-2 border-slate-200 text-slate-900'\n                  }`}\n                >\n                  <p className=\"text-sm leading-relaxed whitespace-pre-wrap font-medium\">\n                    {message.role === 'assistant' ? formatMessage(message.content) : message.content}\n                  </p>\n                  {message.source && message.source !== 'system' && (\n                    <div className=\"mt-2 pt-2 border-t border-slate-200\">\n                      <span className=\"text-xs text-slate-500 flex items-center gap-1 font-semibold\">\n                        {message.source === 'rule_based' ? (\n                          <>\n                            <Brain className=\"w-3 h-3\" />\n                            Instant\n                          </>\n                        ) : (\n                          <>\n                            <Sparkles className=\"w-3 h-3\" />\n                            AI\n                          </>\n                        )}\n                      </span>\n                    </div>\n                  )}\n                </div>\n              </div>\n            ))}\n\n            {isLoading && (\n              <div className=\"flex justify-start\">\n                <div className=\"max-w-[85%] rounded-2xl px-4 py-3 bg-white border-2 border-slate-200\">\n                  <div className=\"flex items-center gap-2\">\n                    <Loader2 className=\"w-4 h-4 text-indigo-600 animate-spin\" />\n                    <span className=\"text-sm text-slate-600 font-medium\">Thinking...</span>\n                  </div>\n                </div>\n              </div>\n            )}\n\n            <div ref={messagesEndRef} />\n          </div>\n\n          {/* Input */}\n          <div className=\"p-4 border-t-2 border-slate-100 bg-white\">\n            <div className=\"flex gap-2\">\n              <input\n                ref={inputRef}\n                type=\"text\"\n                value={input}\n                onChange={(e) => setInput(e.target.value)}\n                onKeyPress={handleKeyPress}\n                placeholder=\"Ask about your growth...\"\n                className=\"flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 \n                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent\n                  text-sm text-slate-900 font-medium placeholder:text-slate-400\"\n                disabled={isLoading}\n              />\n              <button\n                onClick={handleSend}\n                disabled={!input.trim() || isLoading}\n                className=\"p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white\n                  disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg\"\n              >\n                <Send className=\"w-5 h-5\" />\n              </button>\n            </div>\n          </div>\n        </div>\n      )}\n    </>\n  );\n};\n\nexport default CopilotChat;\n", "path": "/app/frontend/src/components/CopilotChat.jsx"}, {"content": "import { Loader2 } from 'lucide-react';\n\nconst LoadingSpinner = ({ message = 'Loading...' }) => {\n  return (\n    <div className=\"flex flex-col items-center justify-center py-16\">\n      <div className=\"relative\">\n        <div className=\"w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin\"></div>\n        <div className=\"absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin\" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>\n      </div>\n      <p className=\"mt-6 text-slate-700 font-semibold text-lg\">{message}</p>\n      <p className=\"mt-2 text-slate-500 text-sm\">AI is analyzing data...</p>\n    </div>\n  );\n};\n\nexport default LoadingSpinner;\n", "path": "/app/frontend/src/components/LoadingSpinner.jsx"}]