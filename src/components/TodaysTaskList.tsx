


import React from "react";

type TaskItem = {
  text: string;
  class?: string;
};

type TodaysTaskListProps = {
  tasks: TaskItem[];
};

const TodaysTaskList: React.FC<TodaysTaskListProps> = ({ tasks }) => (
  <div className="mt-3">
    <div className="font-bold text-sm text-[#F8FAFC] mb-2">
      Today's To Dos
    </div>

    <ul className="space-y-2">
      {tasks.length === 0 ? (
        <li className="text-[#94A3B8] italic text-sm">
          No to-dos yet.
        </li>
      ) : (
        tasks.map((task, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between gap-3 bg-[#161B22]/80 border border-[#2D3748] rounded-xl px-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-[#06B6D4] shrink-0" />

              <span className="text-[#F8FAFC] text-sm truncate">
                {task.text}
              </span>
            </div>

            {task.class && (
              <span className="px-2 py-1 text-xs bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30 rounded-lg shrink-0">
                {task.class}
              </span>
            )}
          </li>
        ))
      )}
    </ul>
  </div>
);

export default TodaysTaskList;