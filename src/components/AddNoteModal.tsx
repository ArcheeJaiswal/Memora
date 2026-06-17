
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface Note {
  title: string;
  content: string;
  tags: string[];
  subject: string;
  isMarkedForRevision: boolean;
  folderId?: string;
  type: "note" | "pdf";
}

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (note: Note) => void;
  folders: Folder[];
  subjects: string[];
}

const inputClass =
  "bg-[#0D1117] border-[#2D3748] text-[#F8FAFC] placeholder-[#64748B] rounded-xl focus:border-[#06B6D4]";

const labelClass = "text-[#CBD5E1] font-medium";

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  folders,
  subjects,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [subject, setSubject] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [isMarkedForRevision, setIsMarkedForRevision] = useState(false);
  const [folderId, setFolderId] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!content.trim()) newErrors.content = "Content is required";
    if (!subject) newErrors.subject = "Please select a subject";
    if (subject === "new" && !newSubject.trim()) {
      newErrors.newSubject = "Please enter a new subject name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
    setSubject("");
    setNewSubject("");
    setIsMarkedForRevision(false);
    setFolderId("");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const finalSubject = subject === "new" ? newSubject.trim() : subject;

    onAdd({
      title: title.trim(),
      content: content.trim(),
      tags,
      subject: finalSubject,
      isMarkedForRevision,
      folderId: folderId === "none" ? undefined : folderId || undefined,
      type: "note",
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#161B22] border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#F8FAFC]">
            Add New Note
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="title" className={labelClass}>
              Title *
            </Label>

            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: "" });
              }}
              placeholder="Enter note title..."
              className={`${inputClass} mt-2 ${errors.title ? "border-red-500" : ""
                }`}
            />

            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="content" className={labelClass}>
              Content *
            </Label>

            <Textarea
              id="content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors({ ...errors, content: "" });
              }}
              placeholder="Write your note content..."
              className={`min-h-[200px] mt-2 ${inputClass} ${errors.content ? "border-red-500" : ""
                }`}
            />

            {errors.content && (
              <p className="text-red-400 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject" className={labelClass}>
                Subject *
              </Label>

              <Select
                value={subject}
                onValueChange={(value) => {
                  setSubject(value);
                  if (errors.subject) setErrors({ ...errors, subject: "" });
                }}
              >
                <SelectTrigger
                  className={`mt-2 ${inputClass} ${errors.subject ? "border-red-500" : ""
                    }`}
                >
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>

                <SelectContent className="bg-[#161B22] border border-[#2D3748] text-[#F8FAFC] rounded-xl">
                  {subjects.map((subj) => (
                    <SelectItem
                      key={subj}
                      value={subj}
                      className="focus:bg-[#7C3AED]/20 focus:text-white"
                    >
                      {subj}
                    </SelectItem>
                  ))}

                  <SelectItem
                    value="new"
                    className="focus:bg-[#7C3AED]/20 focus:text-white"
                  >
                    + Create New Subject
                  </SelectItem>
                </SelectContent>
              </Select>

              {errors.subject && (
                <p className="text-red-400 text-sm mt-1">{errors.subject}</p>
              )}

              {subject === "new" && (
                <div className="mt-2">
                  <Input
                    value={newSubject}
                    onChange={(e) => {
                      setNewSubject(e.target.value);
                      if (errors.newSubject) {
                        setErrors({ ...errors, newSubject: "" });
                      }
                    }}
                    placeholder="Enter new subject..."
                    className={`${inputClass} ${errors.newSubject ? "border-red-500" : ""
                      }`}
                  />

                  {errors.newSubject && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.newSubject}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="folder" className={labelClass}>
                Folder (Optional)
              </Label>

              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger className={`mt-2 ${inputClass}`}>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>

                <SelectContent className="bg-[#161B22] border border-[#2D3748] text-[#F8FAFC] rounded-xl">
                  <SelectItem
                    value="none"
                    className="focus:bg-[#7C3AED]/20 focus:text-white"
                  >
                    No folder
                  </SelectItem>

                  {folders.map((folder) => (
                    <SelectItem
                      key={folder._id}
                      value={folder._id}
                      className="focus:bg-[#7C3AED]/20 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${folder.color}`} />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags" className={labelClass}>
              Tags
            </Label>

            <div className="flex gap-2 mb-2 mt-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tag and press Enter..."
                className={inputClass}
              />

              <Button
                type="button"
                onClick={handleAddTag}
                size="sm"
                className="bg-[#06B6D4] hover:bg-[#0891B2] text-white rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="text-xs bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30 rounded-xl"
                  >
                    {tag}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0 text-[#06B6D4] hover:text-white"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 rounded-2xl border border-[#2D3748] bg-[#0D1117]/70 p-3">
            <input
              type="checkbox"
              id="revision"
              checked={isMarkedForRevision}
              onChange={(e) => setIsMarkedForRevision(e.target.checked)}
              className="accent-[#7C3AED]"
            />

            <Label htmlFor="revision" className="text-[#CBD5E1]">
              Mark for revision queue
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-[#2D3748] bg-[#0D1117] text-[#F8FAFC] hover:bg-[#161B22] rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                !title.trim() ||
                !content.trim() ||
                !subject ||
                (subject === "new" && !newSubject.trim())
              }
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl disabled:opacity-50"
            >
              Add Note
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteModal;