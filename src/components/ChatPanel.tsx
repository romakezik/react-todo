import { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import type { Todo } from "../types/types";

type Msg = { role: "user" | "assistant"; content: string };
type Action = { type: string; text: string };

const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");

function findTodo(list: Todo[], text: string): Todo | null {
  const t = norm(text);
  return (
    list.find((x) => norm(x.text) === t) ??
    list.find((x) => norm(x.text).includes(t) || t.includes(norm(x.text))) ??
    null
  );
}

interface Props {
  todos: Todo[];
  onAddTodo: (text: string) => Promise<void> | void;
  onToggleTodo: (id: string) => Promise<void> | void;
  onDeleteTodo: (id: string) => Promise<void> | void;
}

function ChatPanel({ todos, onAddTodo, onToggleTodo, onDeleteTodo }: Props) {
  const { user } = useAuth();
  const KEY = `chat_history_${user?.id ?? "anon"}`;

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(msgs));
  }, [KEY, msgs]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, msgs, busy]);

  const apply = async (a: Action) => {
    if (a.type === "add_todo") {
      await onAddTodo(a.text);
      return `Добавлено: ${a.text}`;
    }
    const t = findTodo(todos, a.text);
    if (!t) return `Не нашёл: «${a.text}»`;
    if (a.type === "complete_todo") {
      if (t.completed) return `Уже выполнена: ${t.text}`;
      await onToggleTodo(t.id);
      return `Отмечена: ${t.text}`;
    }
    if (!window.confirm(`Удалить «${t.text}»?`)) return "Отменено";
    await onDeleteTodo(t.id);
    return `Удалена: ${t.text}`;
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    setErr(null);

    try {
      const { reply, actions } = await api.chat(next);
      const notes: string[] = [];
      for (const a of actions ?? []) {
        try {
          notes.push(await apply(a));
        } catch {
          notes.push(`Не удалось: ${a.text}`);
        }
      }
      const content = [reply, ...notes].filter(Boolean).join("\n") || "Готово.";
      setMsgs([...next, { role: "assistant", content }]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    if (window.confirm("Очистить историю?")) setMsgs([]);
  };

  return (
    <>
      {!open && (
        <button
          className="chat-tab"
          onClick={() => setOpen(true)}
          aria-label="AI-помощник"
        >
          AI
        </button>
      )}

      <aside
        className={`chat-panel ${open ? "chat-panel--open" : ""}`}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      >
        <header className="chat-header">
          <span>AI-помощник</span>
          <div className="chat-header-actions">
            <button className="chat-clear" onClick={clear} type="button">
              Очистить
            </button>
            <button
              className="chat-close"
              onClick={() => setOpen(false)}
              type="button"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="chat-messages">
          {msgs.length === 0 && (
            <div className="chat-empty">
              Например: «добавь купить молоко», «отметь погулять», «удали задачу
              про мусор»
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="chat-bubble chat-bubble--assistant">Думаю…</div>
          )}
          {err && (
            <div className="chat-bubble chat-bubble--assistant chat-bubble--error">
              Ошибка: {err}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form className="chat-form" onSubmit={send}>
          <input
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напишите сообщение…"
            disabled={busy}
          />
          <button
            className="btn btn-primary chat-send"
            type="submit"
            disabled={busy || !input.trim()}
          >
            {">"}
          </button>
        </form>
      </aside>
    </>
  );
}

export default ChatPanel;
