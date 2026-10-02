/**
 * CC-15: the student assistant.
 *
 * A floating panel that answers questions about the student's own complaints,
 * doubts, answers and notifications by calling backend tools.
 *
 * Conversation lives in component state only — nothing is persisted. Storing
 * chat logs means storing student questions, which is a privacy commitment
 * worth making deliberately rather than by accident.
 */
import { askAssistant, type ChatTurn } from '@/api/chat';
import { CloseOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Spin, Tag } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const { TextArea } = Input;

/** Matches MAX_MESSAGE_LENGTH on the backend, which rejects anything longer. */
const MAX_MESSAGE_LENGTH = 1000;

const SUGGESTIONS = [
  'What is the status of my complaints?',
  'Has anyone answered my doubts?',
  'Do I have any unread updates?',
];

interface Message extends ChatTurn {
  toolsUsed?: string[];
}

const AssistantWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  // Abort any in-flight request if the widget unmounts — a reply nobody will
  // read still costs a completion.
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setBusy(true);

    // askAssistant never throws; a failure comes back as a degraded reply.
    const result = await askAssistant(question, history, controller.signal);

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: result.reply, toolsUsed: result.toolsUsed },
    ]);
    setBusy(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className="fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full cc-fill-brand text-white shadow-lg flex items-center justify-center cursor-pointer"
      >
        {open ? <CloseOutlined /> : <MessageOutlined />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="fixed bottom-20 right-5 z-50 w-[min(24rem,calc(100vw-2.5rem))] max-h-[70vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 cc-fill-brand text-white">
              <p className="text-sm font-semibold">CampusCure Assistant</p>
              <p className="text-[11px] text-brand-100/80">
                Answers about your own complaints, doubts and updates
              </p>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Try asking:</p>
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void send(suggestion)}
                      className="block w-full text-left text-sm rounded-xl border border-border px-3 py-2 hover:bg-surface cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                  <p className="text-[11px] text-muted-foreground pt-1">
                    It can only see your own records, and cannot change anything.
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={message.role === 'user' ? 'text-right' : 'text-left'}
                >
                  <div
                    className={
                      message.role === 'user'
                        ? 'inline-block rounded-2xl bg-[#07759D] text-white px-3 py-2 text-sm max-w-[85%] text-left'
                        : 'inline-block rounded-2xl bg-muted text-foreground px-3 py-2 text-sm max-w-[95%] whitespace-pre-wrap'
                    }
                  >
                    {message.content}
                  </div>
                  {/* Showing which lookups ran makes the answer checkable
                      rather than something to be taken on trust. */}
                  {message.toolsUsed && message.toolsUsed.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {[...new Set(message.toolsUsed)].map((tool) => (
                        <Tag key={tool} className="text-[10px]" color="blue">
                          {tool}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {busy && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Spin size="small" /> Looking that up…
                </div>
              )}
            </div>

            <div className="border-t border-border p-2 flex items-end gap-2">
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="Ask about your complaints or doubts…"
                autoSize={{ minRows: 1, maxRows: 3 }}
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={busy}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => void send(input)}
                disabled={busy || !input.trim()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AssistantWidget;
