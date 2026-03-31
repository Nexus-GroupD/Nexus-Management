"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

type Message = {
  id: number;
  content: string;
  sender: {
    name: string;
  };
};

type Conversation = {
  id: number;
  participants: {
    employee: {
      id: number;
      name: string;
    };
  }[];
  messages: Message[];
};

const DEMO_EMPLOYEES = [
  { id: 1, name: "Alex Rivera" },
  { id: 2, name: "Jordan Lee" },
  { id: 3, name: "Sam Patel" },
  { id: 4, name: "Casey Morgan" },
];

export default function MessagesPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(1);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  useEffect(() => {
    fetch(`/api/conversations?employeeId=${selectedEmployeeId}`)
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        setSelectedConversation(data[0] || null);
      });
  }, [selectedEmployeeId]);

  return (
    <>
      <Navbar pageTitle="Messages" />

      <div style={{ padding: "1.5rem" }}>
        {/* Employee selector */}
        <div style={{ marginBottom: "1rem" }}>
          <span style={{ marginRight: "0.5rem", fontWeight: "bold" }}>
            VIEWING AS:
          </span>
          {DEMO_EMPLOYEES.map((emp) => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployeeId(emp.id)}
              style={{
                marginRight: "0.5rem",
                padding: "0.4rem 0.8rem",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                background:
                  selectedEmployeeId === emp.id ? "#c6f6d5" : "#1a202c",
                color:
                  selectedEmployeeId === emp.id ? "#22543d" : "#e2e8f0",
              }}
            >
              {emp.name}
            </button>
          ))}
        </div>

        {/* Layout */}
        <div className="messages-grid">
          {/* Sidebar */}
          <div className="messages-sidebar">
            <h2>Conversations</h2>

            {conversations.length === 0 && <p>No conversations yet.</p>}

            {conversations.map((conv) => {
              const other = conv.participants.find(
                (p) => p.employee.id !== selectedEmployeeId
              )?.employee;

              const lastMessage =
                conv.messages[conv.messages.length - 1];

              return (
                <div
                  key={conv.id}
                  className="conversation-card"
                  onClick={() => setSelectedConversation(conv)}
                >
                  <strong>{other?.name}</strong>
                  <p>{lastMessage?.content}</p>
                </div>
              );
            })}
          </div>

          {/* Messages */}
          <div className="messages-panel">
            {!selectedConversation && <p>Select a conversation.</p>}

            {selectedConversation && (
              <>
                <h2>
                  {
                    selectedConversation.participants.find(
                      (p) => p.employee.id !== selectedEmployeeId
                    )?.employee.name
                  }
                </h2>

                <div className="message-list">
                  {selectedConversation.messages.map((msg) => {
                    const isMine =
                      msg.sender.name ===
                      DEMO_EMPLOYEES.find(
                        (e) => e.id === selectedEmployeeId
                      )?.name;

                    return (
                      <div
                        key={msg.id}
                        className={`message-bubble ${
                          isMine ? "mine" : "theirs"
                        }`}
                      >
                        <div className="message-sender">
                          {msg.sender.name}
                        </div>
                        <div>{msg.content}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
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
      `}</style>
    </>
  );
}