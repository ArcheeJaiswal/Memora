import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tag } from "lucide-react";



const PIE_COLORS = ["#06B6D4", "#7C3AED"];

type PieStat = {
  completed: number;
  left: number;
};

type LabelStats = {
  [label: string]: {
    day: PieStat;
    month: PieStat;
    year: PieStat;
  };
};

type LabelStatsSectionProps = {
  classStats: LabelStats;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#2D3748] bg-[#0D1117] px-4 py-3 text-sm shadow-2xl">
        <span className="font-semibold text-[#F8FAFC]">
          {payload[0].name}:{" "}
        </span>
        <span className="font-mono text-[#06B6D4]">
          {payload[0].value}
        </span>
      </div>
    );
  }

  return null;
};

const LABELS = [
  { key: "day", label: "Today" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const LabelStatsSection: React.FC<LabelStatsSectionProps> = ({ classStats }) => {
  const labelNames = Object.keys(classStats);

  if (labelNames.length === 0) return null;

  return (
    <section className="w-full mt-6">
      <Card className="w-full bg-[#161B22]/90 border border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-2xl">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="w-11 h-11 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 flex items-center justify-center">
            <Tag className="w-6 h-6 text-[#A78BFA]" />
          </div>

          <CardTitle className="text-xl font-black">
            Task Completion by Label
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-8">
            {labelNames.map((labelName) => (
              <div
                key={labelName}
                className="rounded-3xl border border-[#2D3748] bg-[#0D1117]/70 p-5"
              >
                <div className="font-bold mb-4 text-[#F8FAFC]">
                  {labelName}
                </div>

                <div className="flex flex-row flex-wrap justify-around gap-8">
                  {LABELS.map(({ key, label: timeLabel }) => {
                    const currLabelStats = classStats[labelName];
                    const stat =
                      currLabelStats[key as "day" | "month" | "year"];

                    return (
                      <div
                        key={key}
                        className="flex flex-col items-center min-w-[160px]"
                      >
                        <span className="font-semibold mb-2 text-[#94A3B8]">
                          {timeLabel}
                        </span>

                        <div className="relative w-[145px] h-[145px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Completed", value: stat.completed },
                                  { name: "Left", value: stat.left },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={56}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                              >
                                <Cell key="completed" fill={PIE_COLORS[0]} />
                                <Cell key="left" fill={PIE_COLORS[1]} />
                              </Pie>

                              <Tooltip content={<CustomTooltip />} />

                              <Legend
                                verticalAlign="bottom"
                                height={30}
                                iconType="circle"
                                wrapperStyle={{
                                  color: "var(--app-text-muted)",
                                  fontSize: "12px",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          {/* Centered Percentage Label */}
                          <div className="absolute inset-0 pb-7 flex items-center justify-center pointer-events-none">
                            <span className="text-lg font-bold" style={{ color: "var(--app-cyan)" }}>
                              {stat.completed + stat.left > 0
                                ? `${Math.round(
                                  (stat.completed /
                                    (stat.completed + stat.left)) *
                                  100
                                )}%`
                                : "0%"}
                            </span>
                          </div>
                        </div>

                        <span className="mt-2 text-xs text-[#94A3B8]">
                          Total:{" "}
                          <b className="text-[#F8FAFC]">
                            {stat.completed + stat.left}
                          </b>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default LabelStatsSection;