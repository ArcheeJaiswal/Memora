
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
import { ChartPie } from "lucide-react";

type PieStat = {
  completed: number;
  left: number;
};

type StatData = {
  title: string;
  stat: PieStat;
  color: string;
};

type StatsDashboardProps = {
  stats: StatData[];
  label?: string;
};

const COLORS = [
  "#06B6D4", // completed
  "#7C3AED", // left
];

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

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, label }) => {
  return (
    <section className="w-full mt-8">
      {label && (
        <div className="font-semibold text-lg mb-3 text-[#F8FAFC]">
          {label}
        </div>
      )}

      <Card className="w-full bg-[#161B22]/90 border-[#2D3748] text-[#F8FAFC] rounded-3xl shadow-2xl">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="w-11 h-11 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 flex items-center justify-center">
            <ChartPie className="w-6 h-6 text-[#A78BFA]" />
          </div>

          <CardTitle className="text-xl font-black">
            Todo Coverage Statistics
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col sm:flex-row flex-wrap items-center justify-around gap-8 pt-5">
          {stats.map((data) => (
            <div
              key={data.title}
              className="flex flex-col items-center min-w-[180px] rounded-3xl border border-[#2D3748] bg-[#0D1117]/70 p-5"
            >
              <span className="font-semibold mb-3 text-center text-[#F8FAFC]">
                {data.title}
              </span>

              <div className="relative w-[170px] h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: data.stat.completed },
                        { name: "Left", value: data.stat.left },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell key="completed" fill={COLORS[0]} />
                      <Cell key="left" fill={COLORS[1]} />
                    </Pie>

                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      iconType="circle"
                      wrapperStyle={{
                        color: "var(--app-text-muted)",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Centered Percentage Label */}
                <div className="absolute inset-0 pb-8 flex items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold" style={{ color: "var(--app-cyan)" }}>
                    {data.stat.completed + data.stat.left > 0
                      ? `${Math.round(
                        (data.stat.completed /
                          (data.stat.completed + data.stat.left)) *
                        100
                      )}%`
                      : "0%"}
                  </span>
                </div>
              </div>

              <span className="mt-3 text-xs text-[#94A3B8]">
                Total:{" "}
                <b className="text-[#F8FAFC]">
                  {data.stat.completed + data.stat.left}
                </b>
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
};

export default StatsDashboard;