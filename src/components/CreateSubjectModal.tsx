import React, { useState } from "react";
import { X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSubject: (subjectData: { name: string; folderId?: string }) => void;
  selectedFolder: string;
}

const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen,
  onClose,
  onCreateSubject,
  selectedFolder,
}) => {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateSubject({
      name: name.trim(),
      folderId: selectedFolder === "all" ? undefined : selectedFolder,
    });
    
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#161B22] border border-[#2D3748] rounded-xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
          <Tag className="w-5 h-5 text-[#A78BFA]" />
          Create New Subject
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Subject Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Structures, Algebra"
              className="bg-[#0D1117] border-[#2D3748] focus:border-[#7C3AED] focus:ring-[#7C3AED]/20 text-white"
              required
              autoFocus
            />
          </div>

          {selectedFolder === "all" && (
            <p className="text-xs text-yellow-500/80 mt-1">
              Warning: No folder is selected. This subject will be visible under "All Folders" but won't be linked to a specific folder.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#2D3748] text-white hover:bg-[#2D3748]/50"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
              Create Subject
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubjectModal;
