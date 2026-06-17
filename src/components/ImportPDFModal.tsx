

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, File, X, Plus } from "lucide-react";

interface ImportData {
  title: string;
  subject: string;
  tags: string[];
  folderId?: string;
  pdfUrl?: string;
}

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

interface ImportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ImportData, file: File | null) => void;
  folders: Folder[];
  subjects: string[];
}

const inputClass =
  "bg-[#0D1117] border-[#2D3748] text-[#F8FAFC] placeholder-[#64748B] rounded-xl focus:border-[#06B6D4]";

const labelClass = "text-[#CBD5E1] font-medium";

const ImportPDFModal: React.FC<ImportPDFModalProps> = ({
  isOpen,
  onClose,
  onImport,
  folders = [],
  subjects = [],
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setSelectedFile(null);
    setTitle("");
    setSubject("");
    setNewSubject("");
    setTags([]);
    setTagInput("");
    setFolderId("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type === "application/pdf") {
      setSelectedFile(file);

      if (!title) {
        setTitle(file.name.replace(".pdf", ""));
      }
    } else {
      alert("Please select a valid PDF file");
    }
  };

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

  const handleSubmit = () => {
    if (!selectedFile || !title.trim()) {
      alert("Please select a PDF file and enter a title");
      return;
    }

    if (!subject) {
      alert("Please select a subject");
      return;
    }

    if (subject === "new" && !newSubject.trim()) {
      alert("Please enter a new subject name");
      return;
    }

    const finalSubject = subject === "new" ? newSubject.trim() : subject;

    onImport(
      {
        title: title.trim(),
        subject: finalSubject,
        tags,
        folderId: folderId === "none" ? undefined : folderId || undefined,
      },
      selectedFile
    );

    resetForm();
    onClose();
  };

  const isFormValid =
    selectedFile &&
    title.trim() &&
    subject &&
    (subject !== "new" || newSubject.trim());

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-[#161B22] border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#F8FAFC]">
            Import PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label className={labelClass}>Select PDF File *</Label>

            <div className="mt-2">
              {selectedFile ? (
                <div className="flex items-center gap-3 p-4 border border-[#2D3748] rounded-2xl bg-[#0D1117]">
                  <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 flex items-center justify-center">
                    <File className="w-5 h-5 text-[#A78BFA]" />
                  </div>

                  <span className="flex-1 truncate text-[#F8FAFC]">
                    {selectedFile.name}
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[#94A3B8] hover:text-white hover:bg-[#7C3AED]/10 rounded-xl"
                    onClick={() => {
                      setSelectedFile(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-[#2D3748] rounded-2xl p-8 text-center cursor-pointer hover:border-[#06B6D4] transition-colors bg-[#0D1117]/70"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-9 h-9 mx-auto mb-3 text-[#06B6D4]" />

                  <p className="text-sm text-[#94A3B8]">
                    Click to select a PDF file or drag and drop
                  </p>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,application/pdf"
                className="hidden"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title" className={labelClass}>
              Title *
            </Label>

            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter PDF title..."
              className={`${inputClass} mt-2`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject" className={labelClass}>
                Subject *
              </Label>

              <Select value={subject || ""} onValueChange={setSubject}>
                <SelectTrigger className={`${inputClass} mt-2`}>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>

                <SelectContent className="bg-[#161B22] border border-[#2D3748] text-[#F8FAFC] rounded-xl">
                  {subjects && subjects.length > 0 ? (
                    subjects.map((subj) => (
                      <SelectItem
                        key={subj}
                        value={subj}
                        className="focus:bg-[#7C3AED]/20 focus:text-white"
                      >
                        {subj}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-subjects" disabled>
                      No subjects available
                    </SelectItem>
                  )}

                  <SelectItem
                    value="new"
                    className="focus:bg-[#7C3AED]/20 focus:text-white"
                  >
                    + Create New Subject
                  </SelectItem>
                </SelectContent>
              </Select>

              {subject === "new" && (
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter new subject..."
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>

            <div>
              <Label htmlFor="folder" className={labelClass}>
                Folder (Optional)
              </Label>

              <Select value={folderId || ""} onValueChange={setFolderId}>
                <SelectTrigger className={`${inputClass} mt-2`}>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>

                <SelectContent className="bg-[#161B22] border border-[#2D3748] text-[#F8FAFC] rounded-xl">
                  <SelectItem
                    value="none"
                    className="focus:bg-[#7C3AED]/20 focus:text-white"
                  >
                    No folder
                  </SelectItem>

                  {folders && folders.length > 0 ? (
                    folders.map((folder) => (
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
                    ))
                  ) : (
                    <SelectItem value="no-folders" disabled>
                      No folders available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags" className={labelClass}>
              Tags (Optional)
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
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl disabled:opacity-50"
            >
              Import PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportPDFModal;