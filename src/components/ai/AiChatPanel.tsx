/**
 * AiChatPanel — tannery chemistry AI assistant.
 * Uses the user's Gemini API key (same key as Imagen 3 swatch previews).
 * Embedded in AppShell's right panel on desktop and a bottom sheet on mobile.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ChatRoundDotsBoldDuotone,
  ArrowRightBoldDuotone,
  TrashBinMinimalisticBoldDuotone,
  SettingsBoldDuotone,
} from "solar-icon-set";
import { useGeminiKey } from "@/hooks/use-gemini-key";
import { generateText, type GeminiMessage, TANNERY_SYSTEM_PROMPT } from "@/lib/gemini";
import { Link } from "@tanstack/react-router";
import type { Chemical } from "@/hooks/use-chemicals";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  error?: boolean;
}

interface AiChatPanelProps {
  chemicals?: Chemical[];
}

/* ── Minimal markdown: **bold**, `code`, newlines, code blocks ─────── */

function renderMd(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
      return (
        <pre key={i} className="rounded bg-surface-1 px-2.5 py-2 text-[10px] font-mono overflow-x-auto my-1 whitespace-pre-wrap border border-border">
          {code}
        </pre>
      );
    }
    return (
      <span key={i}>
        {part.split("\n").map((line, li, arr) => (
          <span key={li}>
            {line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((seg, si) => {
              if (seg.startsWith("**") && seg.endsWith("**"))
                return <strong key={si}>{seg.slice(2, -2)}</strong>;
              if (seg.startsWith("`") && seg.endsWith("`"))
                return <code key={si} className="rounded bg-surface-1 px-1 text-[10px] font-mono border border-border/50">{seg.slice(1, -1)}</code>;
              return <span key={si}>{seg}</span>;
            })}
            {li < arr.length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  });
}

/* ── Typing dots ────────────────────────────────────────────────────── */

function TypingDots() {
  return (
    <div className="flex gap-2">
      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <ChatRoundDotsBoldDuotone size={13} color="oklch(0.55 0.18 255)" />
      </div>
      <div className="rounded-lg bg-surface-2 px-3 py-2 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Suggested prompts ──────────────────────────────────────────────── */

const SUGGESTIONS = [
  "What pH should I fix dyes at for chrome leather?",
  "How do I get a deep, even black on bovine hide?",
  "Why is my colour uneven after dyeing?",
  "How much fatliquor (% owlh) for soft upholstery?",
  "Explain dye uptake and how to improve it",
];

/* ── Main panel ─────────────────────────────────────────────────────── */

export function AiChatPanel({ chemicals = [] }: AiChatPanelProps) {
  const { key: geminiKey } = useGeminiKey();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const buildSystemPrompt = useCallback(() => {
    if (chemicals.length === 0) return TANNERY_SYSTEM_PROMPT;
    const chemCtx = chemicals
      .slice(0, 40)
      .map((c) => `${c.name} (${c.category}${c.lab_l != null ? `, L*${c.lab_l?.toFixed(0)} a*${c.lab_a?.toFixed(0)} b*${c.lab_b?.toFixed(0)}` : ""})`)
      .join("; ");
    return `${TANNERY_SYSTEM_PROMPT}\n\nUser's available chemicals: ${chemCtx}`;
  }, [chemicals]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !geminiKey) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history: GeminiMessage[] = [...messages, userMsg]
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role === "user" ? "user" : "model", text: m.text }));

    try {
      const result = await generateText(geminiKey, history, buildSystemPrompt());
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: result.text },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `⚠ ${err.message ?? "Failed to reach Gemini — check your API key in Settings."}`,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [geminiKey, loading, messages, buildSystemPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-4 py-2.5 shrink-0 flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <ChatRoundDotsBoldDuotone size={14} color="oklch(0.55 0.18 255)" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground leading-none">TanAssist</p>
          <p className="text-[9px] text-muted-foreground mt-0.5 truncate">
            {geminiKey ? "Leather chemistry expert · Gemini" : "No API key configured"}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
            title="Clear chat"
          >
            <TrashBinMinimalisticBoldDuotone size={14} color="currentColor" />
          </button>
        )}
      </div>

      {/* No API key */}
      {!geminiKey && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5 py-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-surface-2 flex items-center justify-center">
            <SettingsBoldDuotone size={22} color="oklch(0.32 0.09 255 / 0.4)" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Gemini API key needed</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              TanAssist uses Google Gemini. Add your free API key in Settings — the same key also powers AI swatch previews.
            </p>
          </div>
          <Link to="/settings">
            <button className="mt-1 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Go to Settings →
            </button>
          </Link>
        </div>
      )}

      {/* Empty state with suggestions */}
      {geminiKey && isEmpty && (
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          <p className="text-[10px] text-muted-foreground text-center">
            Ask anything about leather chemistry, recipes, or troubleshooting.
          </p>
          <div className="space-y-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="w-full text-left text-[11px] px-3 py-2 rounded-lg border border-border bg-surface-1 hover:bg-surface-2 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {geminiKey && !isEmpty && (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ChatRoundDotsBoldDuotone size={13} color="oklch(0.55 0.18 255)" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : msg.error
                    ? "bg-red-50 border border-red-100 text-red-700 rounded-bl-sm"
                    : "bg-surface-2 text-foreground rounded-bl-sm"
                }`}
              >
                {msg.role === "user" ? msg.text : renderMd(msg.text)}
              </div>
            </div>
          ))}
          {loading && <TypingDots />}
          <div ref={scrollRef} />
        </div>
      )}

      {/* Input */}
      {geminiKey && (
        <div className="shrink-0 border-t border-border p-2.5">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about dyeing, pH, fatliquors…"
              className="flex-1 h-8 rounded-lg border border-border bg-surface-1 px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={loading || !input.trim()}
            >
              <ArrowRightBoldDuotone size={14} color="currentColor" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
