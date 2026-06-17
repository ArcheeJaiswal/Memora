

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type ClassManagerProps = {
  classes: string[];
  onAddClass: (c: string) => void;
  onDeleteClass: (c: string) => void;
};

export default function ClassManager({
  classes,
  onAddClass,
  onDeleteClass,
}: ClassManagerProps) {
  const [input, setInput] = useState("");

  return (
    <div className="mb-2">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();

          const v = input.trim();

          if (v && !classes.includes(v)) {
            onAddClass(v);
            setInput("");
          }
        }}
      >
        <input
          className="flex-1 bg-[#0D1117] border border-[#2D3748] text-[#F8FAFC] placeholder-[#64748B] px-3 py-2 rounded-xl outline-none focus:border-[#06B6D4]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a class (e.g., DSA, DBMS, OOPS)"
          aria-label="Class name"
        />

        <Button
          type="submit"
          size="sm"
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl px-4"
        >
          Add
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {classes.map((c) => (
          <span
            key={c}
            className="bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#A78BFA] rounded-xl px-3 py-1 flex items-center gap-2 text-sm font-medium"
          >
            <span>{c}</span>

            <button
              aria-label={`Delete ${c}`}
              className="text-[#06B6D4] hover:text-white transition-colors"
              onClick={() => onDeleteClass(c)}
              type="button"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}