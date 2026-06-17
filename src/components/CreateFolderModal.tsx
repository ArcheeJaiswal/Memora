

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (folder: Omit<Folder, "_id">) => void;
  folders: Folder[];
}

const colorOptions = [
  { value: "bg-[#7C3AED]", label: "Purple", class: "bg-[#7C3AED]" },
  { value: "bg-[#06B6D4]", label: "Cyan", class: "bg-[#06B6D4]" },
  { value: "bg-[#A78BFA]", label: "Soft Purple", class: "bg-[#A78BFA]" },
  { value: "bg-[#0891B2]", label: "Deep Cyan", class: "bg-[#0891B2]" },
  { value: "bg-[#334155]", label: "Slate", class: "bg-[#334155]" },
  { value: "bg-[#64748B]", label: "Muted Slate", class: "bg-[#64748B]" },
];

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("bg-[#7C3AED]");

  const resetForm = () => {
    setName("");
    setColor("bg-[#7C3AED]");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      color,
    });

    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[#161B22] border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#F8FAFC]">
            Create New Folder
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-[#CBD5E1] font-medium">
              Folder Name *
            </Label>

            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name..."
              required
              className="mt-2 bg-[#0D1117] border-[#2D3748] text-[#F8FAFC] placeholder-[#64748B] rounded-xl focus:border-[#06B6D4]"
            />
          </div>

          <div>
            <Label htmlFor="color" className="text-[#CBD5E1] font-medium">
              Color
            </Label>

            <div className="grid grid-cols-3 gap-3 mt-3">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`
                    h-11 rounded-2xl border-2 transition-all
                    ${color === colorOption.value
                      ? "border-[#F8FAFC] ring-2 ring-[#06B6D4]"
                      : "border-[#2D3748] hover:border-[#06B6D4]"
                    }
                    ${colorOption.class}
                  `}
                  title={colorOption.label}
                />
              ))}
            </div>
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
              disabled={!name.trim()}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl disabled:opacity-50"
            >
              Create Folder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;