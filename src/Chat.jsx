import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { API_URL, parseReply } from "./config";

const SUGGEST = ["What is his GenAI experience?", "Tell me about the RAG project", "What is his tech stack?", "How can I contact him?"];

async function askApi(q, signal) {
  const url = new URL(API_URL, window.location.origin);
  url.searchParams.set("query", q);
  const r = await fetch(url, { signal });
  const raw = await r.text();
  if (!r.ok) throw new Error(`API returned ${r.status}. ${raw.slice(0, 160)}`);
  let reply;
  try {
    reply = parseReply(JSON.parse(raw));
  } catch {
    reply = raw;
  }
  if (!reply.trim()) throw new Error("The assistant returned an empty response. Please try again.");
  return reply;
}

function EmphasisText({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function InlineText({ text }) {
  const parts = [];
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s<]+)/g;
  let cursor = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      parts.push(<EmphasisText key={`text-${cursor}`} text={text.slice(cursor, match.index)} />);
    }

    if (match[2]) {
      parts.push(
        <a key={`link-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer">
          {match[1]}
        </a>
      );
      cursor = linkPattern.lastIndex;
      continue;
    }

    const fullUrl = match[3];
    const url = fullUrl.replace(/[.,!?;:]+$/, "").replace(/\)+$/, (closing) => {
      const openCount = (fullUrl.match(/\(/g) || []).length;
      const closeCount = (fullUrl.match(/\)/g) || []).length;
      return closeCount > openCount ? ")".repeat(Math.max(0, openCount - (closeCount - closing.length))) : closing;
    });
    const trailing = fullUrl.slice(url.length);
    parts.push(
      <a key={`link-${match.index}`} href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    );
    if (trailing) parts.push(<EmphasisText key={`trailing-${match.index}`} text={trailing} />);
    cursor = linkPattern.lastIndex;
  }

  if (cursor < text.length) {
    parts.push(<EmphasisText key={`text-${cursor}`} text={text.slice(cursor)} />);
  }

  return parts;
}

function FormattedReply({ text }) {
  const blocks = text.trim().split(/\n\s*\n/).filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const isList = lines.every((line) => /^[-*•]\s+/.test(line) || /^\d+[.)]\s+/.test(line));

    if (isList) {
      const numbered = /^\d+[.)]\s+/.test(lines[0]);
      const List = numbered ? "ol" : "ul";
      return (
        <List key={index}>
          {lines.map((line, itemIndex) => (
            <li key={itemIndex}><InlineText text={line.replace(/^(?:[-*•]|\d+[.)])\s+/, "")} /></li>
          ))}
        </List>
      );
    }

    if (/^#{1,3}\s+/.test(lines[0])) {
      return <h4 key={index}><InlineText text={lines[0].replace(/^#{1,3}\s+/, "")} /></h4>;
    }

    return (
      <p key={index}>
        {lines.map((line, lineIndex) => (
          <span key={lineIndex}>
            {lineIndex > 0 && <br />}
            <InlineText text={line} />
          </span>
        ))}
      </p>
    );
  });
}

function FaceAvatar({ thinking = false }) {
  return (
    <span className={`face-avatar${thinking ? " thinking" : ""}`} aria-hidden="true">
      <i className="hair" />
      <i className="ear left" />
      <i className="ear right" />
      <i className="face">
        <i className="brow left" />
        <i className="brow right" />
        <i className="eye left" />
        <i className="eye right" />
        <i className="nose" />
        <i className="mouth" />
      </i>
    </span>
  );
}

export default function Chat({ open, setOpen }) {
  const [msgs, setMsgs] = useState([{ id: 0, role: "bot", text: "Hi, I’m Aman’s AI assistant. Ask me about his GenAI experience, projects or skills." }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasReceivedFirstResponse, setHasReceivedFirstResponse] = useState(false);
  const end = useRef(null);
  const inp = useRef(null);
  const scroll = () => end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  useEffect(() => {
    scroll();
  }, [msgs, busy]);
  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => inp.current?.focus(), 150);
    return () => clearTimeout(timeout);
  }, [open]);

  async function send(q) {
    q = q.trim();
    if (!q || busy) return;
    setText(""); setBusy(true);
    setMsgs((m) => [...m, { id: Date.now(), role: "user", text: q }]);
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 60000);
    try {
      const a = await askApi(q, ac.signal);
      setHasReceivedFirstResponse(true);
      setMsgs((m) => [...m, { id: Date.now() + 1, role: "bot", text: a }]);
    } catch {
      setMsgs((m) => [...m, {
        id: Date.now() + 1,
        role: "bot",
        text: "Right now, I can’t connect to Aman’s AI. Please try again later.",
        error: true,
      }]);
    } finally {
      clearTimeout(to); setBusy(false);
      inp.current?.focus();
    }
  }

  return (
    <>
      <motion.button className="fab" onClick={() => setOpen(!open)} whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
        <i /> {open ? "Close assistant" : "Ask Aman’s AI"}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div className="chat" initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
            <div className="ch">
              <FaceAvatar />
              <div className="ch-title"><b>Aman’s AI assistant</b><small><i /> Here to help</small></div>
              <button onClick={() => setOpen(false)} aria-label="Close chat">×</button>
            </div>
            <div className="msgs">
              <AnimatePresence initial={false}>
                {msgs.map((m) => (
                  <motion.div key={m.id} layout className={`m ${m.role === "user" ? "u" : "a"}${m.error ? " err" : ""}`}
                    initial={{ opacity: 0, y: 14, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35 }}>
                    {m.role === "user" ? m.text : <FormattedReply text={m.text} />}
                  </motion.div>
                ))}
                {busy && (
                  <motion.div key="typing" className="thinking-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <FaceAvatar thinking />
                    <span role="status" aria-live="polite">
                      {hasReceivedFirstResponse ? "Thinking…" : "The server is waking up. Please wait…"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={end} />
            </div>
            {!msgs.some((m) => m.role === "user") && (
              <div className="sg">{SUGGEST.map((s) => <button key={s} type="button" onClick={() => send(s)}>{s}</button>)}</div>
            )}
            <form className="cf" onSubmit={(e) => { e.preventDefault(); send(text); }}>
              <input ref={inp} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about Aman…" aria-label="Your question" />
              <button type="submit" disabled={busy || !text.trim()}>Send</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
