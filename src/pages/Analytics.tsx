import React, { useState, useEffect } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Pie, PieChart
} from "recharts";
import { BookOpen, Calendar, TrendingUp, Target, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

interface Note {
  _id: string;
  subject: string;
  createdAt: string;
  isMarkedForRevision: boolean;
}

export default function Analytics() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [studyTimeData, setStudyTimeData] = useState<{ date: string; minutes: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/data/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes || []);
        }

        // Load study time from local storage (saved by Pomodoro Timer)
        const storedTime = JSON.parse(localStorage.getItem("studyTime") || "{}");
        const timeData = Object.keys(storedTime)
          .slice(-14) // Last 14 days
          .map(date => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            minutes: storedTime[date]
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setStudyTimeData(timeData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text)" }}>
        <div className="w-8 h-8 border-4 border-[var(--app-accent)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // --- Data Processing ---

  // 1. Notes created over time (Last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const notesPerDay = last7Days.map(dateStr => {
    const count = notes.filter(n => new Date(n.createdAt).toDateString() === dateStr).length;
    return {
      date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      count
    };
  });

  // 2. Subject Distribution
  const subjectCounts = notes.reduce((acc, note) => {
    acc[note.subject] = (acc[note.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = ['#7C3AED', '#06B6D4', '#EAB308', '#F97316', '#EC4899', '#8B5CF6'];
  const subjectData = Object.entries(subjectCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 3. Stats
  const totalNotes = notes.length;
  const revisionNotes = notes.filter(n => n.isMarkedForRevision).length;
  const totalSubjects = Object.keys(subjectCounts).length;
  
  // Calculate streak from study time + notes created
  let currentStreak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    
    const hasStudyTime = JSON.parse(localStorage.getItem("studyTime") || "{}")[dateStr] > 0;
    const hasNotes = notes.some(n => new Date(n.createdAt).toDateString() === dateStr);
    
    if (hasStudyTime || hasNotes) {
      currentStreak++;
    } else if (i > 0) { // Don't break streak if today is empty (yet)
      break;
    }
  }

  return (
    <main 
      className="min-h-screen pb-12"
      style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text)" }}
    >
      {/* Header */}
      <div 
        className="border-b"
        style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)" }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">Analytics</h1>
            <Badge className="text-xs bg-[#7C3AED]/10 text-[#A78BFA] border border-[#7C3AED]/30">
              Overview
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-3xl shadow-lg border-0" style={{ backgroundColor: "var(--app-surface)" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#7C3AED]/10 rounded-2xl">
                  <Activity className="w-6 h-6 text-[#7C3AED]" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--app-text-muted)" }}>Current Streak</p>
                  <p className="text-3xl font-bold">{currentStreak} <span className="text-sm font-normal text-[#94A3B8]">days</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-0" style={{ backgroundColor: "var(--app-surface)" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#06B6D4]/10 rounded-2xl">
                  <BookOpen className="w-6 h-6 text-[#06B6D4]" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--app-text-muted)" }}>Total Notes</p>
                  <p className="text-3xl font-bold">{totalNotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-0" style={{ backgroundColor: "var(--app-surface)" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl">
                  <Target className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--app-text-muted)" }}>In Revision Queue</p>
                  <p className="text-3xl font-bold">{revisionNotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-0" style={{ backgroundColor: "var(--app-surface)" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--app-text-muted)" }}>Subjects Covered</p>
                  <p className="text-3xl font-bold">{totalSubjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart: Notes Created */}
          <Card className="lg:col-span-2 rounded-3xl shadow-lg border-0" style={{ backgroundColor: "var(--app-surface)" }}>
            <CardHeader>
              <CardTitle>Notes Created (Last 7 Days)</CardTitle>
              <CardDescription>Daily volume of new content added</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={notesPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-border)" />
                    <XAxis dataKey="date" stroke="var(--app-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--app-text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px', color: 'var(--app-text)' }}
                      itemStyle={{ color: '#7C3AED', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Subject Distribution */}
          <Card className="rounded-3xl shadow-lg border-0" style={{ backgroundColor: "var(--app-surface)" }}>
            <CardHeader>
              <CardTitle>Subject Distribution</CardTitle>
              <CardDescription>Notes breakdown by category</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px', color: 'var(--app-text)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {subjectData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--app-text-muted)" }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Focus Time Tracking */}
          <Card className="lg:col-span-3 rounded-3xl shadow-lg border-0" style={{ backgroundColor: "var(--app-surface)" }}>
            <CardHeader>
              <CardTitle>Focus Time History</CardTitle>
              <CardDescription>Minutes spent in Pomodoro sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                {studyTimeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studyTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-border)" />
                      <XAxis dataKey="date" stroke="var(--app-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--app-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'var(--app-bg)' }}
                        contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '12px', color: 'var(--app-text)' }}
                      />
                      <Bar dataKey="minutes" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center">
                    <Calendar className="w-10 h-10 mb-3 opacity-20" />
                    <p style={{ color: "var(--app-text-muted)" }}>No focus sessions recorded yet.<br/>Start a Pomodoro session to see your stats!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  );
}
