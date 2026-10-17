import {
  useEffect,
  useState,
} from "react";

import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../services/api";

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  color: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  "General",
  "Preparation Goals",
  "Weaknesses",
  "AI Feedback",
  "Technical",
];

const COLORS = [
  { id: "default", classes: "border-white/10" },
  { id: "cyan", classes: "border-cyan-500/40" },
  { id: "pink", classes: "border-pink-500/40" },
  { id: "green", classes: "border-green-500/40" },
];

function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [color, setColor] = useState("default");
  const [saving, setSaving] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getNotes();
      setNotes(data.notes || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load your notes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const startNewNote = () => {
    setEditingId("new");
    setTitle("");
    setContent("");
    setCategory(CATEGORIES[0]);
    setColor("default");
  };

  const startEditNote = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setColor(note.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveNote = async () => {
    if (!title.trim()) {
      setError("Give your note a title before saving.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId === "new") {
        await createNote({
          title: title.trim(),
          content,
          category,
          color,
        });
      } else if (typeof editingId === "number") {
        await updateNote(editingId, {
          title: title.trim(),
          content,
          category,
          color,
        });
      }

      setEditingId(null);
      await loadNotes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save this note. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (note: Note) => {
    try {
      await updateNote(note.id, { is_pinned: !note.is_pinned });
      await loadNotes();
    } catch {
      setError("Could not update the pin status. Please try again.");
    }
  };

  const removeNote = async (noteId: number) => {
    if (!window.confirm("Delete this note? This cannot be undone.")) {
      return;
    }

    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      setError("Could not delete this note. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white px-8 py-10">
      <h1 className="text-5xl font-bold text-cyan-400">
        Interview Notes
      </h1>

        <p className="text-gray-400 mt-3">
          Track interview learnings and improvement goals. Notes are
          saved to your account and available whenever you sign in.
        </p>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl px-6 py-4">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-10">
          <h2 className="text-2xl font-bold text-cyan-400">
            Your Notes
          </h2>

          {editingId === null && (
            <button
              onClick={startNewNote}
              className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition font-bold"
            >
              + New Note
            </button>
          )}
        </div>

        {editingId !== null && (
          <div className="bg-white/5 border border-cyan-500/30 rounded-3xl p-8 mt-6">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="w-full bg-[#0b1120] border border-white/10 rounded-xl px-5 py-3 outline-none text-white font-bold"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your interview reflections, weak areas, preparation goals, AI feedback observations..."
              className="w-full h-[220px] mt-4 bg-[#0b1120] border border-white/10 rounded-2xl p-6 outline-none resize-none text-white leading-8"
            />

            <div className="flex flex-wrap gap-4 mt-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2 outline-none text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`w-8 h-8 rounded-full bg-white/5 border-2 ${c.classes} ${
                      color === c.id ? "ring-2 ring-white" : ""
                    }`}
                    aria-label={`Color ${c.id}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={saveNote}
                disabled={saving}
                className="px-8 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition font-bold disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Note"}
              </button>

              <button
                onClick={cancelEdit}
                disabled={saving}
                className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="text-gray-400 py-12 text-center">
              Loading your notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-gray-400">
              You don't have any notes yet. Start one to track what
              you're learning from each interview.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => {
                const colorMeta =
                  COLORS.find((c) => c.id === note.color) || COLORS[0];

                return (
                  <div
                    key={note.id}
                    className={`bg-white/5 border rounded-3xl p-6 flex flex-col ${colorMeta.classes}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-white break-words">
                        {note.title}
                      </h3>

                      <button
                        onClick={() => togglePin(note)}
                        title={note.is_pinned ? "Unpin" : "Pin"}
                        className={`text-xl shrink-0 ${
                          note.is_pinned
                            ? "text-yellow-400"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    </div>

                    <span className="text-xs uppercase tracking-wide text-cyan-400 mt-2">
                      {note.category}
                    </span>

                    <p className="text-gray-300 mt-3 flex-1 whitespace-pre-wrap break-words line-clamp-6">
                      {note.content || (
                        <span className="text-gray-500 italic">
                          No content.
                        </span>
                      )}
                    </p>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                      <span className="text-xs text-gray-500">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </span>

                      <div className="flex gap-3">
                        <button
                          onClick={() => startEditNote(note)}
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => removeNote(note.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}

export default Notes;
