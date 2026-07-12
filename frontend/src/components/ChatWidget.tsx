"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import axiosInstance from "../../lib/axiosInstance";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  dataType?: "text" | "table" | "list" | "stats";
  data?: any;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || sending) return;

    const history = messages;
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const res = await axiosInstance.post("/ai/chat", { message, history });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.reply || "",
          dataType: res.data.dataType || "text",
          data: res.data.data || null,
        },
      ]);
    } catch {
      setError("Couldn't reach the assistant. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-neutral-900 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        {!open && (
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-neutral-900" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl border border-neutral-200/50 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-neutral-900 geist-mono uppercase tracking-wider">Fleet Assistant</h3>
                <p className="text-xs text-neutral-500 truncate">Ask about vehicles, drivers & trips</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 text-neutral-400">
                  <Bot className="w-8 h-8 mb-3" />
                  <p className="text-sm">Ask me anything about your fleet — availability, drivers, or trip status.</p>
                </div>
              )}

              {messages.map((m, i) => {
                const isUser = m.role === "user";
                const hasStructuredData = m.role === "assistant" && m.dataType && m.dataType !== "text";
                return (
                  <div
                    key={i}
                    className={`px-4 py-2.5 text-sm leading-relaxed rounded-2xl ${
                      isUser
                        ? "ml-auto bg-neutral-900 text-white rounded-br-sm max-w-[85%]"
                        : hasStructuredData
                        ? "bg-neutral-100 text-neutral-900 rounded-bl-sm w-[95%] mr-auto"
                        : "bg-neutral-100 text-neutral-900 rounded-bl-sm max-w-[85%] mr-auto"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none text-neutral-800 break-words dark:prose-invert">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>

                    {/* Render Table */}
                    {m.role === "assistant" && m.dataType === "table" && Array.isArray(m.data) && m.data.length > 0 && (
                      <div className="mt-3 overflow-x-auto border border-neutral-200/60 rounded-xl bg-white text-xs max-w-full shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-neutral-50/80 border-b border-neutral-200/50">
                              {Object.keys(m.data[0]).map((key) => (
                                <th key={key} className="px-3 py-2.5 font-bold text-neutral-700 capitalize whitespace-nowrap">
                                  {key.replace(/_/g, " ")}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {m.data.map((row: any, rIdx: number) => (
                              <tr key={rIdx} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/30">
                                {Object.values(row).map((val: any, cIdx: number) => (
                                  <td key={cIdx} className="px-3 py-2 text-neutral-600 truncate max-w-[160px]" title={String(val)}>
                                    {typeof val === "object" && val !== null ? JSON.stringify(val) : String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Render List */}
                    {m.role === "assistant" && m.dataType === "list" && Array.isArray(m.data) && (
                      <div className="mt-3 space-y-2">
                        {m.data.map((item: any, idx: number) => (
                          <div key={idx} className="p-3 bg-white border border-neutral-200/60 rounded-xl flex flex-col gap-1 text-xs shadow-sm">
                            {item.title && <div className="font-bold text-neutral-800">{item.title}</div>}
                            {item.subtitle && <div className="text-neutral-500">{item.subtitle}</div>}
                            {(item.status || item.badge) && (
                              <div className="flex gap-2 items-center mt-1">
                                {item.status && (
                                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 font-semibold text-[10px] text-neutral-600 uppercase">
                                    {item.status}
                                  </span>
                                )}
                                {item.badge && (
                                  <span className="px-2 py-0.5 rounded-full bg-neutral-900 font-semibold text-[10px] text-white">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render Stats */}
                    {m.role === "assistant" && m.dataType === "stats" && Array.isArray(m.data) && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {m.data.map((stat: any, idx: number) => (
                          <div key={idx} className="p-3 bg-white border border-neutral-200/60 rounded-xl flex flex-col text-xs shadow-sm">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{stat.label}</span>
                            <span className="text-base font-extrabold text-neutral-900 mt-1">{stat.value}</span>
                            {stat.trend && (
                              <span className={`text-[10px] mt-1 font-semibold flex items-center gap-0.5 ${
                                stat.trend === "up" ? "text-emerald-600" : stat.trend === "down" ? "text-rose-600" : "text-neutral-500"
                              }`}>
                                {stat.trend === "up" ? "▲" : stat.trend === "down" ? "▼" : "•"} {stat.change || ""}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {sending && (
                <div className="bg-neutral-100 text-neutral-500 rounded-2xl rounded-bl-sm px-4 py-2.5 w-fit flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-xs">Thinking…</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 text-xs rounded-xl px-4 py-2.5 border border-red-100">
                  {error}
                </div>
              )}
            </div>

            <div className="border-t border-neutral-100 p-3 flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 resize-none max-h-24 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
              <Button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                size="icon"
                className="rounded-xl bg-neutral-900 hover:bg-neutral-800 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
