
import React, { useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AddMultipleTasksModal from "./AddMultipleTasksModal";

type DayType = "work" | "vacation" | "sickness";

interface DayDetailPopoverProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  anchor: React.ReactNode;
  date: Date;
  dayType: DayType;
  onDayTypeChange: (t: DayType) => void;
  events: string[];
  onAddEvent: (e: string) => void;
  onRemoveEvent: (i: number) => void;
}

export default function DayDetailPopover(props: DayDetailPopoverProps) {
  const {
    open,
    onOpenChange,
    anchor,
    date,
    dayType,
    onDayTypeChange,
    events,
    onAddEvent,
    onRemoveEvent,
  } = props;

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTasks = (tasks: string[]) => {
    tasks.forEach(props.onAddEvent);
  };

  const handleAddSingle = () => {
    if (input.trim()) {
      onAddEvent(input.trim());
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 1);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{anchor}</PopoverTrigger>

      <PopoverContent
        className="w-[340px] z-50 bg-[#161B22] border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-2xl"
        align="start"
      >
        <div className="mb-4">
          <div className="font-black text-lg text-[#F8FAFC]">
            {date.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          <div className="text-xs text-[#94A3B8] mt-1">
            Manage day type and tasks
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-[#2D3748] bg-[#0D1117]/70 p-3">
          <div className="text-xs text-[#94A3B8] mb-2">
            Select Day Type
          </div>

          <RadioGroup
            value={dayType}
            onValueChange={(val) => onDayTypeChange(val as DayType)}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="work"
                id="r-work"
                className="border-[#7C3AED] text-[#7C3AED]"
              />
              <label
                htmlFor="r-work"
                className="text-[#A78BFA] cursor-pointer text-sm font-medium"
              >
                Work
              </label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="vacation"
                id="r-vacation"
                className="border-[#64748B] text-[#CBD5E1]"
              />
              <label
                htmlFor="r-vacation"
                className="text-[#CBD5E1] cursor-pointer text-sm font-medium"
              >
                Vacation
              </label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="sickness"
                id="r-sickness"
                className="border-[#06B6D4] text-[#06B6D4]"
              />
              <label
                htmlFor="r-sickness"
                className="text-[#06B6D4] cursor-pointer text-sm font-medium"
              >
                Sickness
              </label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <div className="flex items-center mb-2 justify-between gap-2">
            <div className="text-xs text-[#94A3B8]">
              Important Events
            </div>

            <AddMultipleTasksModal onAddTasks={handleAddTasks} />
          </div>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#0D1117] border border-[#2D3748] text-[#F8FAFC] placeholder-[#64748B] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#06B6D4]"
              placeholder="Type an event..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddSingle();
                }
              }}
            />

            <Button
              type="button"
              onClick={handleAddSingle}
              size="sm"
              className="px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl"
            >
              Add
            </Button>
          </div>

          <ul className="mt-3 space-y-2">
            {events.length === 0 && (
              <li className="text-[#94A3B8] text-xs italic">
                No events added
              </li>
            )}

            {events.map((e, i) => (
              <li
                key={i}
                className="flex justify-between items-center text-sm bg-[#0D1117]/80 border border-[#2D3748] rounded-xl px-3 py-2"
              >
                <span className="text-[#F8FAFC]">{e}</span>

                <button
                  onClick={() => onRemoveEvent(i)}
                  className="text-xs ml-2 text-[#06B6D4] hover:text-white"
                  type="button"
                  aria-label="Remove"
                  title="Remove"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}