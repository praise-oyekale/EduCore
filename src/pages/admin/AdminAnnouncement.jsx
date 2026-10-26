import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} from "../../services/announcementService";

import "./adminannouncements.css";

const CATEGORIES = ["Academic", "Events", "Finance"];

function formatTime(value) {
  let date = null;

  if (typeof value?.toDate === "function") {
    date = value.toDate();
  } else if (typeof value?.seconds === "number") {
    date = new Date(value.seconds * 1000);
  } else if (value instanceof Date) {
    date = value;
  }

  if (!date || Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminAnnouncements() {
  const { user, profile } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState("All");

  const [form, setForm] = useState({
    title: "",
    message: "",
    category: "Academic",
    pinned: false,
  });

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setError(
        "Could not load announcements. Check your connection and permissions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  function handleChange(event) {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handlePublish(event) {
    event.preventDefault();

    if (!user?.uid) {
      setError("Please sign in before publishing an announcement.");
      return;
    }

    setPublishing(true);
    setError("");
    setNotice("");

    try {
      await createAnnouncement({
        ...form,
        authorId: user.uid,
        authorName: profile?.fullName || user.displayName || "School Admin",
      });

      setForm({
        title: "",
        message: "",
        category: "Academic",
        pinned: false,
      });

      setNotice("Announcement published successfully.");
      await loadAnnouncements();
    } catch (err) {
      console.error("Failed to publish announcement:", err);
      setError(err.message || "Could not publish announcement.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete(announcement) {
    const confirmed = window.confirm(
      `Delete "${announcement.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(announcement.id);
    setError("");
    setNotice("");

    try {
      await deleteAnnouncement(announcement.id);

      setAnnouncements((previous) =>
        previous.filter((item) => item.id !== announcement.id),
      );

      setNotice("Announcement deleted.");
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      setError("Could not delete this announcement. Check your permissions.");
    } finally {
      setDeletingId("");
    }
  }

  const visibleAnnouncements =
    filter === "All"
      ? announcements
      : announcements.filter((item) => item.category === filter);

  return (
    <main className="admin-announcements-page">
      <header className="announcements-header">
        <div>
          <h1>Announcements</h1>
          <p>Create and manage announcements for the whole school.</p>
        </div>
      </header>

      {error && (
        <div className="announcement-message announcement-error" role="alert">
          {error}
          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {notice && (
        <div
          className="announcement-message announcement-success"
          role="status"
        >
          {notice}
          <button type="button" onClick={() => setNotice("")}>
            Dismiss
          </button>
        </div>
      )}

      <section className="announcement-create-card">
        <h2>Create announcement</h2>
        <p className="announcement-section-description">
          Your published announcement will be available to school users.
        </p>

        <form onSubmit={handlePublish} className="announcement-form">
          <div className="announcement-form-field">
            <label htmlFor="announcement-title">Title</label>
            <input
              id="announcement-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter announcement title"
              maxLength={150}
              required
            />
          </div>

          <div className="announcement-form-field">
            <label htmlFor="announcement-message">Message</label>
            <textarea
              id="announcement-message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your announcement here..."
              rows={4}
              maxLength={5000}
              required
            />
          </div>

          <div className="announcement-form-bottom">
            <div className="announcement-form-field announcement-category-field">
              <label htmlFor="announcement-category">Category</label>
              <select
                id="announcement-category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <label className="announcement-pin-option">
              <input
                type="checkbox"
                name="pinned"
                checked={form.pinned}
                onChange={handleChange}
              />
              Pin this announcement
            </label>

            <button
              className="announcement-publish-button"
              type="submit"
              disabled={publishing}
            >
              {publishing ? "Publishing..." : "Publish announcement"}
            </button>
          </div>
        </form>
      </section>

      <section className="announcement-list-section">
        <div className="announcement-list-heading">
          <div>
            <h2>Published announcements</h2>
            <p className="announcement-section-description">
              {announcements.length} announcement
              {announcements.length === 1 ? "" : "s"} published
            </p>
          </div>

          <button
            type="button"
            className="announcement-refresh-button"
            onClick={loadAnnouncements}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="announcement-filters" aria-label="Filter announcements">
          {["All", ...CATEGORIES].map((category) => (
            <button
              type="button"
              key={category}
              className={filter === category ? "active" : ""}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="announcement-empty-state">
            Loading announcements...
          </div>
        ) : visibleAnnouncements.length === 0 ? (
          <div className="announcement-empty-state">
            <h3>No announcements found</h3>
            <p>Published announcements will appear here.</p>
          </div>
        ) : (
          <div className="announcement-list">
            {visibleAnnouncements.map((announcement) => (
              <article
                className={`announcement-item ${
                  announcement.pinned ? "is-pinned" : ""
                }`}
                key={announcement.id}
              >
                <div className="announcement-item-content">
                  <div className="announcement-item-meta">
                    <span className="announcement-category-badge">
                      {announcement.category || "Academic"}
                    </span>

                    {announcement.pinned && (
                      <span className="announcement-pinned-badge">Pinned</span>
                    )}
                  </div>

                  <h3>{announcement.title}</h3>
                  <p className="announcement-item-message">
                    {announcement.message}
                  </p>

                  <p className="announcement-item-footer">
                    Posted by {announcement.authorName || "School Admin"}
                    {" · "}
                    {formatTime(announcement.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  className="announcement-delete-button"
                  onClick={() => handleDelete(announcement)}
                  disabled={deletingId === announcement.id}
                >
                  {deletingId === announcement.id ? "Deleting..." : "Delete"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
