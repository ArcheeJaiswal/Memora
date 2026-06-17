import React, { useState, useEffect, useRef } from "react";
import {
  Grid, List, Calendar, BookOpen, Play, ChevronLeft, ChevronRight,
  X, ThumbsUp, ThumbsDown, Minus, RotateCcw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "@/hooks/use-toast";
import NoteCard from "@/components/NoteCard";
import ViewFullModal from "@/components/ui/ViewFullModal";
import EditNoteModal from "@/components/ui/EditNoteModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  subject: string;
  createdAt: string;
  updatedAt: string;
  isMarkedForRevision: boolean;
  folderId?: string;
  type: "note" | "pdf";
  pdfUrl?: string;
}

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

const RevisionQueue = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const hasFetchedData = useRef(false);

  // Session player state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, "easy" | "medium" | "hard">>({});

  // Modal states
  const [isViewFullModalOpen, setIsViewFullModalOpen] = useState(false);
  const [selectedNoteForView, setSelectedNoteForView] = useState<Note | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNoteForEdit, setSelectedNoteForEdit] = useState<Note | null>(null);

  // Fetch data once
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token || hasFetchedData.current) return;

      try {
        const response = await fetch(`${API_URL}/api/data/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setNotes(data.notes || []);
        setFolders(data.folders || []);
        hasFetchedData.current = true;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const revisionNotes = notes.filter((note) => note.isMarkedForRevision);
  const subjects = [...new Set(notes.map((note) => note.subject))];
  const completedCount = Object.keys(ratings).length;
  const progress = revisionNotes.length > 0 ? (completedCount / revisionNotes.length) * 100 : 0;

  // ── Handlers (direct API calls, no debounced sync) ──────────────
  const handleEditNote = (noteId: string) => {
    const noteToEdit = notes.find((note) => note._id === noteId);
    if (noteToEdit) {
      setSelectedNoteForEdit(noteToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async (noteData: any) => {
    const token = localStorage.getItem("token");
    if (!token || !selectedNoteForEdit) return;

    const updatedNote = { ...selectedNoteForEdit, ...noteData, updatedAt: new Date().toISOString() };

    try {
      const response = await fetch(`${API_URL}/api/data/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedNote),
      });
      if (!response.ok) throw new Error("Failed to update note");

      const savedNote = await response.json();
      setNotes((prev) => prev.map((n) => (n._id === selectedNoteForEdit._id ? savedNote : n)));
      toast({ title: "Note updated", description: "Your note has been updated successfully." });
    } catch (error) {
      console.error("Error updating note:", error);
      toast({ title: "Error", description: "Failed to update note.", variant: "destructive" });
    }
    setIsEditModalOpen(false);
    setSelectedNoteForEdit(null);
  };

  const handleViewFull = (noteId: string) => {
    const noteToView = notes.find((note) => note._id === noteId);
    setSelectedNoteForView(noteToView || null);
    setIsViewFullModalOpen(true);
  };

  const handleDeleteNote = async (_id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/data/note/${_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete note");

      setNotes((prev) => prev.filter((note) => note._id !== _id));
      toast({ title: "Note deleted", description: "Your note has been deleted successfully." });
    } catch (err) {
      console.error("Error deleting note:", err);
      toast({ title: "Error", description: "Failed to delete note.", variant: "destructive" });
    }
  };

  const handleToggleRevision = async (_id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const note = notes.find((n) => n._id === _id);
    if (!note) return;

    const updatedNote = { ...note, isMarkedForRevision: !note.isMarkedForRevision };
    setNotes((prev) => prev.map((n) => (n._id === _id ? updatedNote : n)));

    try {
      const response = await fetch(`${API_URL}/api/data/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedNote),
      });
      if (!response.ok) throw new Error("Failed to update revision status");
    } catch (error) {
      console.error("Error toggling revision:", error);
      setNotes((prev) => prev.map((n) => (n._id === _id ? note : n)));
    }

    toast({
      title: note.isMarkedForRevision ? "Removed from revision queue" : "Added to revision queue",
      description: note.isMarkedForRevision ? "Note removed from revision queue." : "Note marked for revision.",
    });
  };

  // ── Session Player Handlers ──────────────────────────────────────
  const startSession = () => {
    if (revisionNotes.length === 0) return;
    setIsSessionActive(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setRatings({});
  };

  const endSession = () => {
    setIsSessionActive(false);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (currentCardIndex < revisionNotes.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const rateCard = (rating: "easy" | "medium" | "hard") => {
    const currentNote = revisionNotes[currentCardIndex];
    setRatings((prev) => ({ ...prev, [currentNote._id]: rating }));

    // Auto-advance after rating
    if (currentCardIndex < revisionNotes.length - 1) {
      setTimeout(() => {
        setCurrentCardIndex((prev) => prev + 1);
        setIsFlipped(false);
      }, 300);
    }
  };

  // ── Session Player UI ────────────────────────────────────────────
  if (isSessionActive && revisionNotes.length > 0) {
    const currentNote = revisionNotes[currentCardIndex];
    const currentRating = ratings[currentNote._id];

    return (
      <main 
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text)" }}
      >
        {/* Session Header */}
        <div 
          className="border-b"
          style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)" }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Revision Session</h1>
                <Badge className="text-xs bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30">
                  {currentCardIndex + 1} / {revisionNotes.length}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#94A3B8]">
                  {completedCount} of {revisionNotes.length} rated
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={endSession}
                  className="gap-2 border-[#2D3748] bg-[#161B22] text-[#F8FAFC] hover:bg-[#1E293B]"
                >
                  <X className="w-4 h-4" />
                  End Session
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-[#1E293B] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Flashcard Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div
            className="w-full max-w-2xl cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={`relative w-full min-h-[360px] transition-all duration-500 transform-style-3d ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#161B22] to-[#1E293B] border border-[#2D3748] p-8 flex flex-col justify-center items-center shadow-2xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <Badge className="mb-4 bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30">
                  {currentNote.subject}
                </Badge>
                <h2 className="text-2xl font-bold text-center mb-4">{currentNote.title}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentNote.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs border-[#2D3748] text-[#94A3B8]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-[#64748B] animate-pulse">Click to reveal content →</p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#161B22] to-[#1E293B] border border-[#2D3748] p-8 flex flex-col shadow-2xl overflow-y-auto"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <Badge className="mb-4 self-start bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30">
                  {currentNote.subject}
                </Badge>
                <h3 className="text-lg font-semibold mb-3">{currentNote.title}</h3>
                <div className="text-[#CBD5E1] whitespace-pre-wrap leading-relaxed flex-1">
                  {currentNote.content}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation & Rating */}
          <div className="mt-8 flex flex-col items-center gap-4">
            {/* Nav arrows */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className="rounded-full border-[#2D3748] bg-[#161B22] text-[#F8FAFC] hover:bg-[#1E293B] disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <span className="text-sm text-[#94A3B8] w-20 text-center">
                {currentCardIndex + 1} of {revisionNotes.length}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={nextCard}
                disabled={currentCardIndex === revisionNotes.length - 1}
                className="rounded-full border-[#2D3748] bg-[#161B22] text-[#F8FAFC] hover:bg-[#1E293B] disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Confidence Ratings */}
            <div className="flex gap-3">
              <Button
                onClick={() => rateCard("hard")}
                className={`gap-2 rounded-xl transition-all ${
                  currentRating === "hard"
                    ? "bg-red-600 text-white ring-2 ring-red-400"
                    : "bg-red-600/10 text-red-400 border border-red-600/30 hover:bg-red-600/20"
                }`}
              >
                <ThumbsDown className="w-4 h-4" /> Hard
              </Button>
              <Button
                onClick={() => rateCard("medium")}
                className={`gap-2 rounded-xl transition-all ${
                  currentRating === "medium"
                    ? "bg-amber-500 text-white ring-2 ring-amber-400"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                }`}
              >
                <Minus className="w-4 h-4" /> Medium
              </Button>
              <Button
                onClick={() => rateCard("easy")}
                className={`gap-2 rounded-xl transition-all ${
                  currentRating === "easy"
                    ? "bg-emerald-500 text-white ring-2 ring-emerald-400"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                }`}
              >
                <ThumbsUp className="w-4 h-4" /> Easy
              </Button>
            </div>

            {/* Session summary when all rated */}
            {completedCount === revisionNotes.length && revisionNotes.length > 0 && (
              <div className="mt-6 p-6 rounded-2xl bg-[#161B22] border border-[#2D3748] text-center max-w-md">
                <h3 className="text-lg font-semibold mb-3">🎉 Session Complete!</h3>
                <div className="flex justify-center gap-6 mb-4 text-sm">
                  <div>
                    <span className="text-emerald-400 font-bold text-xl">
                      {Object.values(ratings).filter((r) => r === "easy").length}
                    </span>
                    <p className="text-[#94A3B8]">Easy</p>
                  </div>
                  <div>
                    <span className="text-amber-400 font-bold text-xl">
                      {Object.values(ratings).filter((r) => r === "medium").length}
                    </span>
                    <p className="text-[#94A3B8]">Medium</p>
                  </div>
                  <div>
                    <span className="text-red-400 font-bold text-xl">
                      {Object.values(ratings).filter((r) => r === "hard").length}
                    </span>
                    <p className="text-[#94A3B8]">Hard</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={startSession}
                    className="gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl"
                  >
                    <RotateCcw className="w-4 h-4" /> Restart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={endSession}
                    className="gap-2 border-[#2D3748] bg-[#161B22] text-[#F8FAFC] hover:bg-[#1E293B] rounded-xl"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ── Default Queue View ───────────────────────────────────────────
  return (
    <main 
      className="min-h-screen"
      style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text)" }}
    >
      {/* Header */}
      <div 
        className="border-b"
        style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)" }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">Revision Queue</h1>
              <Badge className="text-xs bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30">
                {revisionNotes.length} notes for revision
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {revisionNotes.length > 0 && (
                <Button
                  onClick={startSession}
                  className="gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl"
                >
                  <Play className="w-4 h-4" />
                  Start Session
                </Button>
              )}
              <div className="flex border border-[#2D3748] bg-[#161B22] rounded-xl">
                <Toggle
                  pressed={viewMode === "grid"}
                  onPressedChange={() => setViewMode("grid")}
                  className="px-3 text-[#94A3B8] data-[state=on]:bg-[#7C3AED] data-[state=on]:text-white hover:bg-[#1E293B]"
                >
                  <Grid className="w-4 h-4" />
                </Toggle>
                <Toggle
                  pressed={viewMode === "list"}
                  onPressedChange={() => setViewMode("list")}
                  className="px-3 text-[#94A3B8] data-[state=on]:bg-[#7C3AED] data-[state=on]:text-white hover:bg-[#1E293B]"
                >
                  <List className="w-4 h-4" />
                </Toggle>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#161B22]/90 border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-lg">
                  <BookOpen className="w-5 h-5 text-[#06B6D4]" />
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">Total Notes</p>
                  <p className="text-2xl font-semibold">{revisionNotes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#161B22]/90 border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">This Week</p>
                  <p className="text-2xl font-semibold">
                    {
                      revisionNotes.filter(
                        (note) =>
                          new Date(note.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#161B22]/90 border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-lg">
                  <Grid className="w-5 h-5 text-[#06B6D4]" />
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">Subjects</p>
                  <p className="text-2xl font-semibold">
                    {new Set(revisionNotes.map((note) => note.subject)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes for Revision */}
        {revisionNotes.length === 0 ? (
          <Card className="bg-[#161B22]/90 border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-xl">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-[#64748B]" />
              <h3 className="text-lg font-semibold mb-2">No notes marked for revision</h3>
              <p className="text-[#94A3B8]">
                Mark notes for revision from your notes page to see them here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Notes for Revision</h2>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-4"
              }
            >
              {revisionNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  folders={folders}
                  viewMode={viewMode}
                  onEdit={handleEditNote}
                  onViewFull={handleViewFull}
                  onDelete={handleDeleteNote}
                  onToggleRevision={handleToggleRevision}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ViewFullModal
        isOpen={isViewFullModalOpen}
        onClose={() => {
          setIsViewFullModalOpen(false);
          setSelectedNoteForView(null);
        }}
        note={selectedNoteForView}
        folders={folders}
      />

      <EditNoteModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedNoteForEdit(null);
        }}
        note={selectedNoteForEdit}
        folders={folders}
        subjects={subjects}
        onSave={handleSaveEdit}
      />
    </main>
  );
};

export default RevisionQueue;