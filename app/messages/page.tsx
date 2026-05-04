"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Message = {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
  sender: { id: number; name: string };
};

type Participant = {
  employeeId: number;
  employee: { id: number; name: string };
};

type Conversation = {
  id: number;
  participants: Participant[];
  messages: Message[];
};

type Person = { id: number; name: string; role: string };
type Me = { id: number; name: string; role: string };

export default function MessagesPage() {
  const [me, setMe]                         = useState<Me | null>(null);
  const [people, setPeople]                 = useState<Person[]>([]);
  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [newMessage, setNewMessage]         = useState("");
  const [newRecipientId, setNewRecipientId] = useState<number | null>(null);
  const [sending, setSending]               = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => {
      if (d?.id) setMe(d);
    });
  }, []);

  useEffect(() => {
    fetch("/api/people").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setPeople(d);
    });
  }, []);

  useEffect(() => {
    if (!me?.id) return;
    loadConversations();
  }, [me]);

  const loadConversations = async () => {
    if (!me?.id) return;
    const res  = await fetch(`/api/conversations?employeeId=${me.id}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setConversations(data);
      if (data.length > 0 && !selectedConvId) setSelectedConvId(data[0].id);
    }
  };

  const handleCreateConversation = async () => {
    if (!newRecipientId || !me?.id || newRecipientId === me.id) return;
    const res  = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: me.id, otherEmployeeId: newRecipientId }),
    });
    const conv = await res.json();
    await loadConversations();
    setSelectedConvId(conv.id);
    setNewRecipientId(null);
  };

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !selectedConvId || !me?.id) return;
    if (trimmed.length > 500) { alert("Message cannot exceed 500 characters."); return; }
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedConvId, senderId: me.id, content: trimmed }),
    });
    setNewMessage("");
    await loadConversations();
    setSending(false);
  };

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const others = people.filter((p) => p.id !== me?.id);

  if (!me) return (
    <>
      <Navbar pageTitle="Messages" />
      <div style={pageStyle}><p style={{ color: "#64748b" }}>Loading…</p></div>
    </>
  );

  return (
    <>
      <Navbar pageTitle="Messages" />
      <main style={pageStyle}>

        <div style={newConvBar}>
          <span style={labelStyle}>New conversation with:</span>
          <select
            style={selectStyle}
            value={newRecipientId ?? ""}
            onChange={(e) => setNewRecipientId(Number(e.target.value) || null)}
          >
            <option value="">Select person…</option>
            {others.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
            ))}
          </select>
          <button style={greenBtn} onClick={handleCreateConversation} disabled={!newRecipientId}>
            Start
          </button>
        </div>

        <div style={gridStyle}>
          <aside style={sidebarStyle}>
            <h2 style={sidebarTitle}>
              Conversations
              {conversations.length > 0 && <span style={countBadge}>{conversations.length}</span>}
            </h2>
            {conversations.length === 0
              ? <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>No conversations yet.</p>
              : conversations.map((conv) => {
                  const otherNames = conv.participants
                    .filter((p) => p.employeeId !== me.id)
                    .map((p) => p.employee.name)
                    .join(", ");
                  const last = conv.messages[conv.messages.length - 1];
                  const isActive = conv.id === selectedConvId;
                  return (
                    <div key={conv.id} style={convCard(isActive)} onClick={() => setSelectedConvId(conv.id)}>
                      <div style={convName}>{otherNames || "Conversation"}</div>
                      <div style={convPreview}>{last?.content ?? "No messages yet"}</div>
                    </div>
                  );
                })
            }
          </aside>

          <section style={panelStyle}>
            {!selectedConv
              ? <p style={{ color: "#94a3b8" }}>Select a conversation to start chatting.</p>
              : <>
                  <h2 style={panelTitle}>
                    {selectedConv.participants
                      .filter((p) => p.employeeId !== me.id)
                      .map((p) => p.employee.name)
                      .join(", ")}
                  </h2>
                  <div style={messageList}>
                    {selectedConv.messages.length === 0
                      ? <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>No messages yet. Say hi!</p>
                      : selectedConv.messages.map((msg) => {
                          const mine = msg.senderId === me.id;
                          return (
                            <div key={msg.id} style={bubbleWrapper(mine)}>
                              <div style={bubble(mine)}>
                                <div style={senderLabel}>{msg.sender.name}</div>
                                <div>{msg.content}</div>
                              </div>
                            </div>
                          );
                        })
                    }
                  </div>
                  <div style={inputRow}>
                    <input
                      style={inputStyle}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Type a message…"
                      maxLength={500}
                    />
                    <button style={greenBtn} onClick={handleSend} disabled={sending || !newMessage.trim()}>
                      {sending ? "…" : "Send"}
                    </button>
                  </div>
                </>
            }
          </section>
        </div>
      </main>
    </>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: "1100px", margin: "0 auto", padding: "6rem 1.5rem 3rem",
  display: "flex", flexDirection: "column", gap: "1.25rem",
};
const newConvBar: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap",
  background: "white", borderRadius: "12px", padding: "0.875rem 1.25rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem", fontWeight: 600, color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
};
const selectStyle: React.CSSProperties = {
  flex: 1, minWidth: "180px", padding: "0.5rem 0.75rem",
  border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem",
  color: "#0f172a", background: "#f8fafc",
};
const greenBtn: React.CSSProperties = {
  background: "#10b981", color: "white", border: "none",
  padding: "0.55rem 1.1rem", borderRadius: "8px", fontSize: "0.875rem",
  fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};
const gridStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.25rem",
};
const sidebarStyle: React.CSSProperties = {
  background: "white", borderRadius: "16px", padding: "1.25rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
  display: "flex", flexDirection: "column", gap: "0.5rem",
};
const sidebarTitle: React.CSSProperties = {
  fontSize: "0.9rem", fontWeight: 700, color: "#0f172a",
  display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 0.5rem",
};
const countBadge: React.CSSProperties = {
  background: "#eff6ff", color: "#3b82f6", borderRadius: "999px",
  padding: "0.1rem 0.5rem", fontSize: "0.72rem", fontWeight: 600,
};
const convCard = (active: boolean): React.CSSProperties => ({
  padding: "0.75rem", borderRadius: "10px", cursor: "pointer",
  background: active ? "#f0fdf4" : "transparent",
  border: active ? "1.5px solid #bbf7d0" : "1.5px solid transparent",
  transition: "all 0.15s",
});
const convName: React.CSSProperties = {
  fontWeight: 600, fontSize: "0.875rem", color: "#0f172a", marginBottom: "0.2rem",
};
const convPreview: React.CSSProperties = {
  fontSize: "0.78rem", color: "#64748b",
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};
const panelStyle: React.CSSProperties = {
  background: "white", borderRadius: "16px", padding: "1.5rem",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
  display: "flex", flexDirection: "column", gap: "1rem",
};
const panelTitle: React.CSSProperties = {
  fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0,
};
const messageList: React.CSSProperties = {
  flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem",
  maxHeight: "420px", overflowY: "auto", padding: "0.5rem 0",
};
const bubbleWrapper = (mine: boolean): React.CSSProperties => ({
  display: "flex", justifyContent: mine ? "flex-end" : "flex-start",
});
const bubble = (mine: boolean): React.CSSProperties => ({
  maxWidth: "65%", padding: "0.65rem 1rem", borderRadius: "14px",
  background: mine ? "#dcfce7" : "#f1f5f9", color: "#0f172a",
});
const senderLabel: React.CSSProperties = {
  fontSize: "0.72rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: 500,
};
const inputRow: React.CSSProperties = {
  display: "flex", gap: "0.75rem", marginTop: "auto",
};
const inputStyle: React.CSSProperties = {
  flex: 1, padding: "0.65rem 0.875rem",
  border: "1.5px solid #e2e8f0", borderRadius: "10px",
  fontSize: "0.9rem", color: "#0f172a", background: "#f8fafc",
};
