"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

type Announcement = {
  id: number;
  title: string;
  message: string;
  category: string;
  time: string;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "Schedule Updated",
      message: "New shifts have been added for next week.",
      category: "Schedule",
      time: "Today",
    },
  ]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("General");

  const [canCreate, setCanCreate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  // Get permissions
    useEffect(() => {
    fetch("/api/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
        const isAdmin = data?.role === "admin";
        const perms = data?.permissions || [];

        setCanCreate(isAdmin && perms.includes("announcements.create"));
        setCanDelete(isAdmin && perms.includes("announcements.delete"));
        })
        .catch(() => {
        setCanCreate(false);
        setCanDelete(false);
        });
    }, []);

  const handlePost = () => {
    if (!title.trim() || !message.trim()) return;

    const newAnnouncement: Announcement = {
      id: Date.now(),
      title,
      message,
      category,
      time: new Date().toLocaleString(),
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setTitle("");
    setMessage("");
    setCategory("General");
  };

  const handleDelete = (id: number) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  return (
    <>
      <Navbar pageTitle="Announcements" />

      <main className="ann-page">

        {/* 🔔 VIEW ONLY MESSAGE */}
        {!canCreate && (
          <div className="info-banner">
            You have view-only access. Contact an admin to make changes.
          </div>
        )}

        {/* CREATE (ONLY IF ALLOWED) */}
        {canCreate && (
          <section className="ann-card">
            <h3 className="section-title">Create Announcement</h3>

            <div className="ann-form">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title..."
              />

              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>General</option>
                <option>Schedule</option>
                <option>Reminder</option>
                <option>Urgent</option>
              </select>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write announcement details..."
                rows={4}
              />

              <button
                onClick={handlePost}
                disabled={!title.trim() || !message.trim()}
              >
                Post Announcement
              </button>
            </div>
          </section>
        )}

        {/* LIST */}
        <section className="ann-section">
          <h3 className="section-title">Recent Announcements</h3>

          <div className="ann-list">
            {announcements.length === 0 ? (
              <div className="ann-card empty">No announcements yet.</div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="ann-card">
                  <div className="ann-top">
                    <span className={`badge ${a.category.toLowerCase()}`}>
                      {a.category}
                    </span>

                    {/* DELETE ONLY IF ALLOWED */}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <h2 className="title">{a.title}</h2>
                  <p className="message">{a.message}</p>
                  <span className="time">{a.time}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <style>{`
        .ann-page *,
        .ann-page *::before,
        .ann-page *::after {
          box-sizing: border-box;
        }

        .ann-page {
          max-width: 850px;
          margin: 0 auto;
          padding: 6rem 1.5rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-banner {
          background: rgba(66,153,225,0.1);
          border: 1px solid rgba(66,153,225,0.3);
          color: #63b3ed;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.9rem;
        }

        .section-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #718096;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .ann-card {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 1.25rem;
        }

        .ann-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ann-form input,
        .ann-form textarea,
        .ann-form select {
          width: 100%;
          padding: 0.7rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: #111827;
          color: white;
        }

        .ann-form button {
          background: #48bb78;
          border: none;
          padding: 0.7rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .ann-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .ann-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .badge {
          font-size: 0.7rem;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          color: #a0aec0;
        }

        .badge.urgent {
          background: rgba(245,101,101,0.15);
          color: #fc8181;
        }

        .badge.schedule {
          background: rgba(66,153,225,0.15);
          color: #63b3ed;
        }

        .badge.reminder {
          background: rgba(236,201,75,0.15);
          color: #ecc94b;
        }

        .delete {
          background: rgba(245,101,101,0.15);
          color: #fc8181;
          border: none;
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          cursor: pointer;
        }

        .title {
          color: #f7fafc;
          margin: 0.75rem 0 0.25rem;
        }

        .message {
          color: #a0aec0;
        }

        .time {
          font-size: 0.75rem;
          color: #718096;
        }

        .empty {
          text-align: center;
          color: #718096;
        }
      `}</style>
    </>
  );
}