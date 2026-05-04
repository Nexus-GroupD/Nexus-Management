"use client";

import { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      const data = await res.json();

      const botMessage = {
        role: "assistant",
        text: data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error connecting to AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(!open)} style={styles.fab}>
        💬
      </button>

      {/* Chat window */}
      {open && (
        <div style={styles.chatBox}>
          <div style={styles.header}>
            <span>Chat Support</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.message,
                  alignSelf:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  background:
                    msg.role === "user" ? "#DCF8C6" : "#eee",
                }}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                AI is typing...
              </div>
            )}
          </div>

          <div style={styles.inputArea}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={styles.input}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fab: {
    position: "fixed",
    bottom: 20,
    right: 20,
    width: 55,
    height: 55,
    borderRadius: "50%",
    border: "none",
    fontSize: 22,
    cursor: "pointer",
    background: "#111",
    color: "white",
    zIndex: 1000,
  },
  chatBox: {
    position: "fixed",
    bottom: 90,
    right: 20,
    width: 300,
    height: 400,
    background: "white",
    border: "1px solid #ddd",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 1000,
  },
  header: {
    padding: 10,
    background: "#111",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
  },
  messages: {
    flex: 1,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
  },
  message: {
    padding: 8,
    borderRadius: 8,
    maxWidth: "80%",
  },
  inputArea: {
    display: "flex",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: 10,
    border: "none",
    outline: "none",
  },
};