import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, Grid, List, Upload, FolderPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "@/hooks/use-toast";
import NoteCard from "@/components/NoteCard";
import AddNoteModal from "@/components/AddNoteModal";
import ImportPDFModal from "@/components/ImportPDFModal";
import CreateFolderModal from "@/components/CreateFolderModal";
import CreateSubjectModal from "@/components/CreateSubjectModal";
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
  type: 'note' | 'pdf';
  pdfUrl?: string;
}

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

interface Subject {
  _id: string;
  name: string;
  folderId?: string;
}

const Notes = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const hasFetchedData = useRef(false);

  // Fetch data on first render
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token || hasFetchedData.current) return;

      try {
        const response = await fetch(`${API_URL}/api/data/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch notes and folders");

        const data = await response.json();
        setNotes(data.notes || []);
        setFolders(data.folders || []);
        setSubjectsList(data.subjects || []);
        hasFetchedData.current = true;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isImportPDFModalOpen, setIsImportPDFModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isViewFullModalOpen, setIsViewFullModalOpen] = useState(false);
  const [selectedNoteForView, setSelectedNoteForView] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const [selectedNoteForEdit, setSelectedNoteForEdit] = useState(null);
  
  const activeSubjects = selectedFolder === "all"
    ? subjectsList
    : subjectsList.filter(sub => sub.folderId === selectedFolder);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === "all" || note.subject === selectedSubject;
    const matchesFolder = selectedFolder === "all" || note.folderId === selectedFolder;
    return matchesSearch && matchesSubject && matchesFolder;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAddNote = async (noteData: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newNote = {
      ...noteData,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_URL}/api/data/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) throw new Error("Failed to save note");

      const savedNote = await response.json();
      setNotes(prev => [...prev, savedNote]);
      toast({ title: "Note added", description: "Note was successfully created." });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({ title: "Error", description: "Failed to add note.", variant: "destructive" });
    }
  };

  const handleEditNote = (noteId: string) => {
    const noteToEdit = notes.find(note => note._id === noteId);
    setSelectedNoteForEdit(noteToEdit);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (noteData: any) => {
    const token = localStorage.getItem("token");
    if (!token || !selectedNoteForEdit) return;

    const updatedNote = {
      ...selectedNoteForEdit,
      ...noteData,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_URL}/api/data/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) throw new Error("Failed to update note");

      const savedNote = await response.json();
      setNotes(prev => prev.map(n => n._id === selectedNoteForEdit._id ? savedNote : n));
      toast({ title: "Note updated", description: "Your note has been updated successfully." });
    } catch (error) {
      console.error("Error updating note:", error);
      toast({ title: "Error", description: "Failed to update note.", variant: "destructive" });
    }

    setIsEditModalOpen(false);
    setSelectedNoteForEdit(null);
  };

  const handleDeleteNote = async (_id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/data/note/${_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.msg || "Failed to delete note");
      }

      setNotes(prev => prev.filter(note => note._id !== _id));
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting note:", err);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleRevision = async (_id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const note = notes.find(n => n._id === _id);
    if (!note) return;

    const updatedNote = { ...note, isMarkedForRevision: !note.isMarkedForRevision };

    // Optimistically update UI
    setNotes(prev => prev.map(n => n._id === _id ? updatedNote : n));

    try {
      const response = await fetch(`${API_URL}/api/data/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) throw new Error("Failed to update revision status");
    } catch (error) {
      console.error("Error toggling revision:", error);
      // Revert on failure
      setNotes(prev => prev.map(n => n._id === _id ? note : n));
    }

    toast({
      title: note.isMarkedForRevision ? "Removed from revision queue" : "Added to revision queue",
      description: note.isMarkedForRevision ? "Note removed from revision queue." : "Note marked for revision.",
    });
  };

  const handleCreateFolder = async (folderData: Omit<Folder, '_id'>) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/data/folder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(folderData),
      });

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.msg || "Failed to create folder");
      }

      const newFolder = await response.json();
      setFolders(prev => [...prev, newFolder]);
      toast({
        title: "Folder created",
        description: "New folder has been created successfully.",
      });
    } catch (err) {
      console.error("Error creating folder:", err);
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/data/folder/${folderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.msg || "Failed to delete folder");
      }

      setFolders(prev => prev.filter(f => f._id !== folderId));
      
      // The user chose to keep the notes safe, so we unset the folderId from any notes that had it
      setNotes(prev => prev.map(n => n.folderId === folderId ? { ...n, folderId: undefined } : n));

      if (selectedFolder === folderId) {
        setSelectedFolder("all");
      }

      toast({
        title: "Folder deleted",
        description: "Folder deleted successfully. Notes are kept safe in 'All Notes'.",
      });
    } catch (err) {
      console.error("Error deleting folder:", err);
      toast({
        title: "Error",
        description: "Failed to delete folder.",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubject = async (subjectData: { name: string; folderId?: string }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/data/subject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subjectData),
      });

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.msg || "Failed to create subject");
      }

      const newSubject = await response.json();
      setSubjectsList(prev => [...prev, newSubject]);
      toast({
        title: "Subject created",
        description: "New subject has been created successfully.",
      });
    } catch (err) {
      console.error("Error creating subject:", err);
      toast({
        title: "Error",
        description: "Failed to create subject.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/data/subject/${subjectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.msg || "Failed to delete subject");
      }

      setSubjectsList(prev => prev.filter(s => s._id !== subjectId));

      if (selectedSubject === subjectId) {
        setSelectedSubject("all");
      }

      toast({
        title: "Subject deleted",
        description: "Subject deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting subject:", err);
      toast({
        title: "Error",
        description: "Failed to delete subject.",
        variant: "destructive",
      });
    }
  };

  const handleViewFull = (noteId: string) => {
    const noteToView = notes.find(note => note._id === noteId);
    setSelectedNoteForView(noteToView);
    setIsViewFullModalOpen(true);
  };

  const handleImportPDF = async (pdfData: { title: string; subject: string; tags: string[]; folderId?: string }, file: File | null) => {
    if (!file) {
      toast({ title: "Error", description: "No PDF file selected", variant: "destructive" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`${API_URL}/api/data/upload-pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!uploadResponse.ok) throw new Error('PDF upload failed');

      const { url } = await uploadResponse.json();

      const newNote = {
        ...pdfData,
        _id: Date.now().toString(),
        content: "PDF content imported - ready for review and annotation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isMarkedForRevision: false,
        type: 'pdf' as const,
        pdfUrl: url
      };

      const response = await fetch(`${API_URL}/api/data/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) throw new Error("Failed to save PDF note");

      const savedNote = await response.json();
      setNotes(prev => [...prev, savedNote]);
      toast({
        title: "PDF imported successfully",
        description: "Your PDF has been imported as a note.",
      });
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({ title: "Error", description: "Failed to upload PDF file", variant: "destructive" });
    }
  };

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
              <h1 className="text-2xl font-semibold">My Notes</h1>
              <Badge className="text-xs bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30">
                {filteredNotes.length} notes
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateFolderModalOpen(true)}
                className="gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportPDFModalOpen(true)}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Import PDF
              </Button>
              <Button
                onClick={() => setIsAddNoteModalOpen(true)}
                className="gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
              >
                <Plus className="w-4 h-4" />
                Add Notes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex border rounded-md">
              <Toggle
                pressed={viewMode === "grid"}
                onPressedChange={() => setViewMode("grid")}
                className="px-3"
              >
                <Grid className="w-4 h-4" />
              </Toggle>
              <Toggle
                pressed={viewMode === "list"}
                onPressedChange={() => setViewMode("list")}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Toggle>
            </div>
          </div>
        </div>

        {/* Folders Display */}
        {folders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Folders</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedFolder === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedFolder("all");
                  setSelectedSubject("all");
                }}
              >
                All Folders
              </Button>
              {folders.map(folder => (
                <div key={folder._id} className="group flex items-center shadow-sm rounded-md">
                  <Button
                    variant={selectedFolder === folder._id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedFolder(selectedFolder === folder._id ? "all" : folder._id);
                      setSelectedSubject("all");
                    }}
                    className="gap-2 rounded-r-none"
                  >
                    <div className={`w-2 h-2 rounded-full ${folder.color}`} />
                    {folder.name}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFolder(folder._id)}
                    className="px-2 rounded-l-none border-l-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subjects Display (Sub-folders) */}
        <div className="mb-8 pl-4 border-l-2 border-[#2D3748]">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Subjects</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSubject === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubject("all")}
            >
              All Subjects
            </Button>
            {activeSubjects.map(subject => (
              <div key={subject._id} className="group flex items-center shadow-sm rounded-md">
                <Button
                  variant={selectedSubject === subject.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubject(selectedSubject === subject.name ? "all" : subject.name)}
                  className="rounded-r-none"
                >
                  {subject.name}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSubject(subject._id)}
                  className="px-2 rounded-l-none border-l-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateSubjectModalOpen(true)}
              className="gap-2 text-[#A78BFA] border-[#A78BFA]/30 hover:bg-[#A78BFA]/10"
              title="Create an empty subject"
            >
              <Plus className="w-3 h-3" />
              New Subject
            </Button>
          </div>
        </div>

        {/* Notes Display */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No notes found</div>
            <Button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create your first note
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-4"
          }>
            {filteredNotes.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                folders={folders}
                viewMode={viewMode}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onToggleRevision={handleToggleRevision}
                onViewFull={handleViewFull}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onAdd={handleAddNote}
        folders={folders}
        subjects={subjectsList.map(s => s.name)}
      />
      <ViewFullModal
        isOpen={isViewFullModalOpen}
        onClose={() => {
          setIsViewFullModalOpen(false);
          setSelectedNoteForView(null);
        }}
        note={selectedNoteForView}
        folders={folders}
      />
      <ImportPDFModal
        isOpen={isImportPDFModalOpen}
        onClose={() => setIsImportPDFModalOpen(false)}
        onImport={(data, file) => handleImportPDF(data, file)}
        folders={folders}
        subjects={subjectsList.map(s => s.name)}
      />
      <EditNoteModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedNoteForEdit(null);
        }}
        note={selectedNoteForEdit}
        folders={folders}
        subjects={subjectsList.map(s => s.name)}
        onSave={handleSaveEdit}
      />
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreate={handleCreateFolder}
        folders={folders}
      />
      <CreateSubjectModal
        isOpen={isCreateSubjectModalOpen}
        onClose={() => setIsCreateSubjectModalOpen(false)}
        onCreateSubject={handleCreateSubject}
        selectedFolder={selectedFolder}
      />
    </main>
  );
};

export default Notes;
