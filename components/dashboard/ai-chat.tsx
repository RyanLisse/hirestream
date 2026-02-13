"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, X, Minimize2, Maximize2, Loader2, Sparkles, User, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCall {
  name: string;
  args: any;
  result?: any;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: "Scrape Striive", prompt: "Scrape Striive platform for new jobs" },
  { label: "Scrape All", prompt: "Scrape all platforms for new job listings" },
  { label: "Pipeline Stats", prompt: "Show me the current pipeline statistics" },
  { label: "Grade Candidates", prompt: "Grade new candidates using AI" },
];

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI recruitment assistant. I can help you scrape job platforms, analyze candidates, manage your pipeline, and more. What would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedToolCalls, setExpandedToolCalls] = useState<Set<string>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard shortcut: Cmd+K to toggle chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setInput("");
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let assistantMessage: Message = {
        role: "assistant",
        content: "",
        toolCalls: [],
        timestamp: new Date(),
      };

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);

            if (data.content) {
              assistantMessage.content += data.content;
            }

            if (data.toolCalls) {
              assistantMessage.toolCalls = [
                ...(assistantMessage.toolCalls || []),
                ...data.toolCalls,
              ];
            }

            // Update message in real-time
            setMessages((prev) => {
              const withoutLast = prev[prev.length - 1]?.role === "assistant" ? prev.slice(0, -1) : prev;
              return [...withoutLast, { ...assistantMessage }];
            });
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }

      // Final update
      if (assistantMessage.content || assistantMessage.toolCalls?.length) {
        setMessages((prev) => {
          const withoutLast = prev[prev.length - 1]?.role === "assistant" ? prev.slice(0, -1) : prev;
          return [...withoutLast, assistantMessage];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const toggleToolCall = (messageIndex: number, toolIndex: number) => {
    const key = `${messageIndex}-${toolIndex}`;
    setExpandedToolCalls((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 z-50"
        size="icon"
        aria-label="Open AI Assistant"
      >
        <Bot className="h-6 w-6" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 z-50 border-border bg-card shadow-2xl transition-all duration-300",
        isExpanded ? "w-[600px] h-[700px]" : "w-[400px] h-[500px]"
      )}
    >
      {/* Header */}
      <div className="flex flex-row items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">AI Assistant</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 text-muted-foreground hover:text-card-foreground"
            aria-label={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 text-muted-foreground hover:text-card-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b border-border p-3">
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.prompt)}
              className="text-xs"
              disabled={isLoading}
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className={cn("p-4", isExpanded ? "h-[500px]" : "h-[300px]")}>
        <div className="space-y-4">
          {messages.map((message, messageIndex) => (
            <div
              key={`${messageIndex}-${message.timestamp.getTime()}`}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[75%] space-y-2 rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {message.toolCalls.map((tool, toolIndex) => {
                      const key = `${messageIndex}-${toolIndex}`;
                      const isExpanded = expandedToolCalls.has(key);
                      return (
                        <div key={toolIndex} className="text-xs">
                          <button
                            onClick={() => toggleToolCall(messageIndex, toolIndex)}
                            className="flex w-full items-center gap-1 rounded bg-accent/50 px-2 py-1 hover:bg-accent/70 transition-colors"
                          >
                            <Sparkles className="h-3 w-3 text-accent-foreground" />
                            <span className="font-mono font-medium">{tool.name}</span>
                            {tool.result && (
                              <span className="ml-auto text-muted-foreground">
                                {typeof tool.result === "object" && "count" in tool.result
                                  ? `${tool.result.count} items`
                                  : "result"}
                              </span>
                            )}
                            {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                          </button>
                          {isExpanded && (
                            <div className="mt-1 rounded bg-muted/50 p-2 font-mono text-[10px] text-muted-foreground">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify({ args: tool.args, result: tool.result }, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <User className="h-4 w-4 text-accent" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything... (Cmd+K to toggle)"
            className="flex-1"
            disabled={isLoading}
            aria-label="Chat message input"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
