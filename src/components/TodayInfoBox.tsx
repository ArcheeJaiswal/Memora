
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AddMultipleTasksModal from "./AddMultipleTasksModal";

type DayType = "work" | "vacation" | "sickness";

const colorMap: Record<DayType, string> = {
  work: "bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30",
  vacation: "bg-[#334155]/70 text-[#CBD5E1] border border-[#475569]",
  sickness: "bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30",
};

interface TodayInfoBoxProps {
  dayType: DayType;
  events: string[];
  date: Date;
  doneMap: boolean[];
  onToggleDone: (eventIdx: number) => void;
  isToday: boolean;
  isSelected: boolean;
  onDayTypeChange: (t: DayType) => void;
  onAddEvent: (e: string) => void;
  onRemoveEvent: (i: number) => void;
  onAddTasks: (tasks: string[]) => void;
}

export default function TodayInfoBox({
  dayType,
  events,
  date,
  doneMap,
  onToggleDone,
  isToday,
  isSelected,
  onDayTypeChange,
  onRemoveEvent,
  onAddTasks,
}: TodayInfoBoxProps) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const isPast = date < now;

  return (
    <div className="bg-[#161B22]/90 border border-[#2D3748] shadow-2xl rounded-3xl p-5 flex flex-col min-w-[260px] gap-3 text-[#F8FAFC]">
      <div className="flex items-center mb-1">
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${colorMap[dayType]}`}
        >
          {dayType}
        </div>

        <div className="ml-auto font-medium text-xs text-[#94A3B8]">
          {date.toLocaleDateString()}
        </div>
      </div>

      {isSelected && !isPast && (
        <div className="mb-2">
          <div className="text-xs text-[#94A3B8] mb-2">
            Change Day Type
          </div>

          <RadioGroup
            value={dayType}
            onValueChange={(val) => onDayTypeChange(val as DayType)}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="work"
                id="side-work"
                className="border-[#7C3AED] text-[#7C3AED]"
              />
              <label
                htmlFor="side-work"
                className="text-[#A78BFA] cursor-pointer text-sm font-medium"
              >
                Work
              </label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="vacation"
                id="side-vacation"
                className="border-[#64748B] text-[#CBD5E1]"
              />
              <label
                htmlFor="side-vacation"
                className="text-[#CBD5E1] cursor-pointer text-sm font-medium"
              >
                Vacation
              </label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="sickness"
                id="side-sickness"
                className="border-[#06B6D4] text-[#06B6D4]"
              />
              <label
                htmlFor="side-sickness"
                className="text-[#06B6D4] cursor-pointer text-sm font-medium"
              >
                Sickness
              </label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="text-xs text-[#94A3B8] mb-1">
        Events for {isToday ? "today" : date.toLocaleDateString()}:
      </div>

      <ul className="space-y-2">
        {events.length
          ? events.map((e, i) => (
            <li
              key={i}
              className="text-sm bg-[#0D1117]/80 border border-[#2D3748] rounded-2xl px-3 py-2 flex items-center gap-2"
            >
              <Checkbox
                checked={!!doneMap[i]}
                onCheckedChange={() => {
                  if (!isPast) onToggleDone(i);
                }}
                className="border-[#06B6D4] mr-1 data-[state=checked]:bg-[#06B6D4] data-[state=checked]:border-[#06B6D4]"
                aria-label={doneMap[i] ? "Mark as not done" : "Mark as done"}
                id={`event-checkbox-${i}`}
                disabled={isPast}
              />

              {doneMap[i] && (
                <Check size={18} className="mr-1 text-[#06B6D4]" />
              )}

              <span
                className={
                  doneMap[i]
                    ? "line-through text-[#64748B]"
                    : "text-[#F8FAFC]"
                }
              >
                {e}
              </span>

              {!isPast && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto text-[#94A3B8] hover:text-white hover:bg-[#7C3AED]/10 rounded-xl"
                  onClick={() => onRemoveEvent(i)}
                  aria-label="Remove"
                  title="Remove"
                >
                  ✕
                </Button>
              )}
            </li>
          ))
          : null}
      </ul>

      {isSelected && !isPast && (
        <div className="flex flex-col gap-2 mt-3">
          <AddMultipleTasksModal
            onAddTasks={onAddTasks}
            buttonLabel="Add multiple To Dos"
          />
        </div>
      )}
    </div>
  );
}