import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AddMultipleTasksModalProps {
  onAddTasks: (tasks: string[]) => void;
  buttonLabel?: string;
}

export default function AddMultipleTasksModal({
  onAddTasks,
  buttonLabel = "Add multiple tasks",
}: AddMultipleTasksModalProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const tasks = input
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (tasks.length) {
      onAddTasks(tasks);
      setInput("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          type="button"
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white border border-[#7C3AED]/30 rounded-xl font-semibold"
        >
          {buttonLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#161B22] border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-2xl">
        <DialogHeader>
          <div className="font-black text-xl mb-2 text-[#F8FAFC]">
            Paste tasks
          </div>
          <p className="text-sm text-[#94A3B8]">
            Add one task per line.
          </p>
        </DialogHeader>

        <Textarea
          className="w-full bg-[#0D1117] border border-[#2D3748] focus:border-[#06B6D4] text-white placeholder-[#64748B] rounded-2xl min-h-[160px]"
          rows={6}
          placeholder={"Task 1\nTask 2\nTask 3"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <DialogFooter>
          <Button
            onClick={handleAdd}
            className="bg-[#06B6D4] hover:bg-[#0891B2] text-white rounded-xl font-bold"
          >
            Add tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}