
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type AddTaskSectionProps = {
  availableLabels: string[];
  onAddTask: (task: string, label?: string) => void;
};

const NO_LABEL_VALUE = "__none__";

const AddTaskSection: React.FC<AddTaskSectionProps> = ({
  availableLabels,
  onAddTask,
}) => {
  const [input, setInput] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string>(NO_LABEL_VALUE);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) return;

    onAddTask(
      trimmed,
      selectedLabel === NO_LABEL_VALUE ? undefined : selectedLabel
    );

    setInput("");
    setSelectedLabel(NO_LABEL_VALUE);
  };

  return (
    <form className="flex flex-col gap-2 mt-3" onSubmit={handleAdd}>
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Task description"
          className="flex-1 bg-[#0D1117] border border-[#2D3748] text-[#F8FAFC] placeholder-[#64748B] py-2 px-3 rounded-xl text-sm outline-none focus:border-[#06B6D4]"
          aria-label="New task"
        />

        {availableLabels.length > 0 ? (
          <Select value={selectedLabel} onValueChange={setSelectedLabel}>
            <SelectTrigger className="w-full sm:w-[130px] bg-[#0D1117] border border-[#2D3748] text-[#F8FAFC] rounded-xl focus:ring-[#06B6D4]">
              <SelectValue placeholder="Choose label" />
            </SelectTrigger>

            <SelectContent className="bg-[#161B22] border border-[#2D3748] text-[#F8FAFC] rounded-xl">
              <SelectItem
                key={NO_LABEL_VALUE}
                value={NO_LABEL_VALUE}
                className="focus:bg-[#7C3AED]/20 focus:text-white"
              >
                No label
              </SelectItem>

              {availableLabels.map((c) => (
                <SelectItem
                  key={c}
                  value={c}
                  className="focus:bg-[#7C3AED]/20 focus:text-white"
                >
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-xs text-[#94A3B8] px-2 py-2">
            No labels
          </div>
        )}

        <Button
          size="sm"
          type="submit"
          className="bg-[#06B6D4] hover:bg-[#0891B2] text-white rounded-xl px-4"
        >
          Add
        </Button>
      </div>
    </form>
  );
};

export default AddTaskSection;