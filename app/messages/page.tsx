"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

const DEMO_EMPLOYEES = [
  { id: 1, name: "Alex Rivera", role: "Manager" },
  { id: 2, name: "Jordan Lee", role: "Employee" },
  { id: 3, name: "Sam Patel", role: "Employee" },
  { id: 4, name: "Casey Morgan", role: "Employee" },
];

type Message = {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
  sender: {
    id: number;
    name: string;
  };
};

type Participant = {
  employeeId: number;
  employee: {
    id: number;
    name: string;
  };
};

type Conversation = {
  id: number;
  participants: Participant[];
  messages: Message[];
};

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [newConversationEmployeeId, setNewConversationEmployeeId] =
    useState<number>(2);

  useEffect(() => {
    async function loadConversations() {
      const res = await fetch(`/api/conversations?employeeId=${selectedId}`);
      const data = await res.json();
      setConversations(data);
      if (data.length > 0 && !selectedConversationId) {
        setSelectedConversationId(data[0].id);
      }
    }

    loadConversations();
  }, [selectedId]);
  async function handleCreateConversation() {
    if (!newConversationEmployeeId || newConversationEmployeeId === selectedId)
      return;

    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: selectedId,
        otherEmployeeId: newConversationEmployeeId,
      }),
    });

    const newConversation = await res.json();

    const updatedRes = await fetch(
      `/api/conversations?employeeId=${selectedId}`,
    );
    const updatedData = await updatedRes.json();

    setConversations(updatedData);
    setSelectedConversationId(newConversation.id);
  }
  // Handles sending a message from the UI to the backend API.
  // Includes client-side validation to improve user experience and reduce invalid requests.
  // Note: Security is still enforced on the server (never trust client input alone).
async function handleSend() {
  const trimmedMessage = newMessage.trim();

  // Prevent sending empty messages
  // Improves UX and avoids unnecessary API calls
  if (!trimmedMessage || !selectedConversationId) return;

  // Enforce message length limit on client side
  // Helps prevent large payloads before reaching the server
  if (trimmedMessage.length > 500) {
    alert("Message cannot exceed 500 characters.");
    return;
  }

  // Send validated message to backend API
  await fetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    // JSON encoding ensures structured and safe data transmission
    body: JSON.stringify({
      conversationId: selectedConversationId,
      senderId: selectedId,
      content: trimmedMessage,
    }),
  });

  // Clear input after sending
  setNewMessage("");

  // Refresh conversations to display updated messages
  const res = await fetch(`/api/conversations?employeeId=${selectedId}`);
  const data = await res.json();
  setConversations(data);
}

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId,
  );

  return (
    <>
      <Navbar pageTitle="Messages" />
      <main className="messages-page">
        <div className="messages-selector">
          <label className="selector-label">Viewing as:</label>
          <div className="selector-pills">
            {DEMO_EMPLOYEES.map((emp) => (
              <button
                key={emp.id}
                className={`selector-pill ${selectedId === emp.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedId(emp.id);
                  setSelectedConversationId(null);
                }}
              >
                {emp.name}
              </button>
            ))}
          </div>
        </div>

        <div className="messages-grid">
          <aside className="messages-sidebar">
            <h2>
              Conversations{" "}
              {conversations.length > 0 && `(${conversations.length})`}
            </h2>
            <div className="new-conversation">
              <select
                value={newConversationEmployeeId}
                onChange={(e) =>
                  setNewConversationEmployeeId(Number(e.target.value))
                }
              >
                {DEMO_EMPLOYEES.filter((emp) => emp.id !== selectedId).map(
                  (emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ),
                )}
              </select>

              <button onClick={handleCreateConversation}>New</button>
            </div>
            {conversations.length === 0 ? (
              <p>No conversations yet.</p>
            ) : (
              conversations.map((conversation) => {
                const otherNames = conversation.participants
                  .filter((p) => p.employeeId !== selectedId)
                  .map((p) => p.employee.name)
                  .join(", ");

                const lastMessage =
                  conversation.messages[conversation.messages.length - 1];

                return (
                  <div
                    key={conversation.id}
                    className="conversation-card"
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <strong>{otherNames || "Conversation"}</strong>
                    <p>{lastMessage?.content ?? "No messages yet"}</p>
                  </div>
                );
              })
            )}
          </aside>

          <section className="messages-panel">
            {!selectedConversation ? (
              <p>Select a conversation.</p>
            ) : (
              <>
                <h2>
                  {selectedConversation.participants
                    .filter((p) => p.employeeId !== selectedId)
                    .map((p) => p.employee.name)
                    .join(", ")}
                </h2>

                <div className="message-list">
                  {selectedConversation.messages.map((message) => {
                    const mine = message.senderId === selectedId;

                    return (
                      <div
                        key={message.id}
                        className={`message-bubble ${mine ? "mine" : "theirs"}`}
                      >
                        <div className="message-sender">
                          {message.sender.name}
                        </div>
                        <div>{message.content}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="message-input">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                  />
                  <button onClick={handleSend}>Send</button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <style>{`
        .new-conversation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .new-conversation select {
          flex: 1;
          padding: 0.5rem;
          border-radius: 8px;
          border: none;
        }

        .new-conversation button {
          background: #48bb78;
          color: white;
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
        }

        .message-input {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .message-input input {
          flex: 1;
          padding: 0.5rem;
          border-radius: 8px;
          border: none;
        }

        .message-input button {
          background: #48bb78;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
        }

        .messages-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 6rem 1.5rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .messages-selector {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .selector-label {
          font-size: 0.8rem;
          color: #718096;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .selector-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .selector-pill {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.08);
          color: #a0aec0;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
        }

        .selector-pill.active,
        .selector-pill:hover {
          background: rgba(72,187,120,0.12);
          border-color: rgba(72,187,120,0.3);
          color: #48bb78;
        }

        .messages-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.5rem;
        }

        .messages-sidebar,
        .messages-panel {
          background: #1a202c;
          padding: 1rem;
          border-radius: 12px;
        }

        .messages-sidebar h2,
        .messages-panel h2 {
          margin-bottom: 1rem;
          color: #f7fafc;
        }
          
        .messages-sidebar p,
        .messages-panel p {
        color: #e2e8f0;
        }

        .conversation-card {
          padding: 0.75rem;
          border-radius: 10px;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .conversation-card:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .conversation-card strong {
          display: block;
          color: #f8fafc; /* name */
        }

        .conversation-card p {
          margin: 0;
          color: #cbd5e1; /* preview text */
        }

        /* Messages */
        .message-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .message-bubble {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          color: #f8fafc;
        }

        .message-bubble.mine {
          align-self: flex-end;
          background: rgba(72, 187, 120, 0.18);
        }

        .message-bubble.theirs {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.08);
        }

        .message-sender {
          font-size: 0.75rem;
          color: #a0aec0;
          margin-bottom: 0.25rem;
        }

        @media (max-width: 700px) {
          .messages-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
