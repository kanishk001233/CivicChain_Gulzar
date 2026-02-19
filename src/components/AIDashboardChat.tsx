import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../utils/api';

interface AIDashboardChatProps {
  scope: api.AIChatScope;
  stateId: string;
  stateName: string;
  municipalId?: string;
  municipalName?: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export function AIDashboardChat({
  scope,
  stateId,
  stateName,
  municipalId,
  municipalName,
}: AIDashboardChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        scope === 'municipal'
          ? `Ask anything about ${municipalName} dashboard data.`
          : `Ask anything about ${stateName} state dashboard data.`,
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const sendDebounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async () => {
    const question = newMessage.trim();
    if (!question || sending) return;

    const userMessage: AIMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const answer = await api.askGeminiDashboardAssistant({
        scope,
        question,
        stateId,
        stateName,
        municipalId,
        municipalName,
        chatHistory: [...messages, userMessage].map((m) => ({ role: m.role, text: m.text })),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: answer,
        },
      ]);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('AI chat error:', error);
      const description = error instanceof Error ? error.message : 'Failed to get AI response';
      toast.error('AI chat failed', { description });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (sendDebounceRef.current) {
        clearTimeout(sendDebounceRef.current);
      }
      sendDebounceRef.current = setTimeout(() => {
        handleSendMessage();
      }, 100); // Small debounce to prevent accidental double-sends
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {!isUser && (
                  <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                    <Sparkles className="h-3 w-3" />
                    <span>CivicChain AI</span>
                  </div>
                )}
                <p className={`text-sm whitespace-pre-wrap ${isUser ? 'text-white' : 'text-gray-900'}`}>
                  {message.text}
                </p>
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={messageInputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI about complaints, trends, departments..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent max-h-32"
            rows={2}
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
