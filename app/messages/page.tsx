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

  useEffect(() => {
    async function loadConversations() {
      const res = await fetch(`/api/conversations?employeeId=${selectedId}`);
      const data = await res.json();
      setConversations(data);
    }

    loadConversations();
  }, [selectedId]);

  const selectedConversation = conversations[0];

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
                onClick={() => setSelectedId(emp.id)}
              >
                {emp.name}
              </button>
            ))}
          </div>
        </div>

        <div className="messages-grid">
          <aside className="messages-sidebar">
            <h2>Conversations</h2>
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
                  <div key={conversation.id} className="conversation-card">
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
                        <div className="message-sender">{message.sender.name}</div>
                        <div>{message.content}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <style>{`
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
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 1rem;
        }

        .conversation-card {
          padding: 0.85rem;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          margin-bottom: 0.75rem;
        }

        .conversation-card p {
          margin: 0.35rem 0 0;
          color: #a0aec0;
          font-size: 0.9rem;
        }

        .message-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .message-bubble {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
        }

        .message-bubble.mine {
          align-self: flex-end;
          background: rgba(72,187,120,0.15);
          color: #f7fafc;
        }

        .message-bubble.theirs {
          align-self: flex-start;
          background: rgba(255,255,255,0.06);
          color: #f7fafc;
        }

        .message-sender {
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: #a0aec0;
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