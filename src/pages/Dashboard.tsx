import React, { useState, useEffect } from "react";
import ProfileCard from "@/components/ProfileCard";
import ReactiveBackground from "@/components/ReactiveBackground";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TodayInfoBox from "@/components/TodayInfoBox";
import DashboardStatsCard from "@/components/DashboardStatsCard";
import { CalendarDays, Target, BookOpen, CheckCircle2, CalendarClock, Trash2 } from "lucide-react";

type DayType = "work" | "vacation" | "sickness";
type PieStat = { completed: number; left: number };
type TaskItem = { text: string };
type UpcomingEvent = { _id: string; text: string; date?: string; time?: string };

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function getInitialDays() {
  const result: { [key: string]: DayType } = {};
  const now = new Date();

  for (let i = 1; i <= 31; i++) {
    if (i % 6 === 0)
      result[new Date(now.getFullYear(), now.getMonth(), i).toDateString()] =
        "vacation";
    else if (i % 13 === 0)
      result[new Date(now.getFullYear(), now.getMonth(), i).toDateString()] =
        "sickness";
    else
      result[new Date(now.getFullYear(), now.getMonth(), i).toDateString()] =
        "work";
  }

  return result;
}

function getInitialDoneMap(eventsObj: { [key: string]: TaskItem[] }) {
  const done: { [key: string]: boolean[] } = {};
  for (const key in eventsObj) {
    done[key] = eventsObj[key]?.map(() => false);
  }
  return done;
}

function getTodoCoverageStats(
  doneMap: { [key: string]: boolean[] },
  events: { [key: string]: TaskItem[] },
  range: { start: Date; end: Date }
): { completed: number; left: number } {
  let completed = 0;
  let left = 0;

  for (
    let d = new Date(range.start);
    d <= range.end;
    d.setDate(d.getDate() + 1)
  ) {
    const dayStr = new Date(d).toDateString();
    const eventsThisDay = events[dayStr] || [];
    const doneList = doneMap[dayStr] || [];

    eventsThisDay.forEach((task, i) => {
      if (doneList[i]) completed++;
      else left++;
    });
  }

  return { completed, left };
}

/**
 * Dashboard Component
 * 
 * The main view for the Memora application. It handles task tracking,
 * calendar interactions, state synchronization with the backend,
 * and rendering of the Pomodoro timer and upcoming events.
 */
const Dashboard = () => {
  // Calendar UI state
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  
  // Application Data State
  const [days, setDays] = useState<{ [key: string]: DayType }>(getInitialDays);
  const [events, setEvents] = useState<{ [key: string]: TaskItem[] }>({});
  const [doneMap, setDoneMap] = useState<{ [key: string]: boolean[] }>(() =>
    getInitialDoneMap({})
  );
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [userId, setUserId] = useState<string | null>(null);
  const [token] = useState<string | null>(localStorage.getItem("token"));
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user profile");

        const data = await response.json();
        setUserId(data.id || data.userId);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch tasks");

        const data = await response.json();
        setEvents(data.events || {});
        setDoneMap(data.doneMap || {});
        setDays(data.days || getInitialDays());
        setUpcomingEvents(data.upcomingEvents || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsDataLoaded(true);
      }
    };

    fetchUserId();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;

    const saveTasks = async () => {
      try {
        if (!token) return;

        const response = await fetch(`${API_URL}/api/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            events,
            doneMap,
            days,
            upcomingEvents,
          }),
        });

        if (!response.ok) throw new Error("Failed to save tasks");
      } catch (error) {
        console.error("Error saving tasks:", error);
      }
    };

    if (
      Object.keys(events).length > 0 ||
      Object.keys(doneMap).length > 0 ||
      Object.keys(days).length > 0 ||
      upcomingEvents.length > 0
    ) {
      saveTasks();
    }
  }, [events, doneMap, token, days, upcomingEvents]);

  const selectedString = selectedDay?.toDateString() ?? "";
  const selectedType: DayType = days[selectedString] || "work";
  const selectedEvents: string[] = (events[selectedString] || []).map(
    (ev) => ev.text
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toDateString();

  const handleCalendarSelect = (d?: Date) => {
    if (!d) return;

    setDate(d);
    setDisplayMonth(new Date(d.getFullYear(), d.getMonth()));

    const clicked = new Date(d);
    clicked.setHours(0, 0, 0, 0);
    setSelectedDay(d);
  };

  const handleDayTypeChange = (t: DayType) => {
    if (selectedDay) {
      setDays((prev) => ({
        ...prev,
        [selectedDay.toDateString()]: t,
      }));
    }
  };

  const handleAddEvent = (event: string) => {
    if (selectedDay) {
      const dayStr = selectedDay.toDateString();

      setEvents((prev) => {
        const newTask: TaskItem = { text: event };

        const newEvents = {
          ...prev,
          [dayStr]: [...(prev[dayStr] || []), newTask],
        };

        setDoneMap((dPrev) => ({
          ...dPrev,
          [dayStr]: [...(dPrev[dayStr] || []), false],
        }));

        return newEvents;
      });
    }
  };

  const handleAddUpcomingEvent = (text: string, dateStr?: string, timeStr?: string) => {
    setUpcomingEvents((prev) => [
      ...prev,
      {
        _id: Date.now().toString(), // Simple client-side ID for new items
        text,
        date: dateStr,
        time: timeStr,
      },
    ]);
  };

  const handleDeleteUpcomingEvent = (id: string) => {
    setUpcomingEvents((prev) => prev.filter((e) => e._id !== id));
  };

  const handleDeleteTask = (date: Date, index: number) => {
    const dayStr = date.toDateString();
    if (!token) return;

    setEvents((prev) => {
      const currentEvents = prev[dayStr] || [];
      const newEvents = { ...prev };
      newEvents[dayStr] = currentEvents.filter((_, i) => i !== index);
      return newEvents;
    });

    setDoneMap((prev) => {
      const currentDone = prev[dayStr] || [];
      const newDoneMap = { ...prev };
      newDoneMap[dayStr] = currentDone.filter((_, i) => i !== index);
      return newDoneMap;
    });

    fetch(`${API_URL}/api/tasks/${dayStr}/${index}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch((error) => console.error("Error deleting task:", error));
  };

  const enhancedHandleRemoveEvent = (i: number) => {
    if (selectedDay) handleDeleteTask(selectedDay, i);
  };

  const handleToggleDone = (idx: number) => {
    if (selectedDay) {
      const dayStr = selectedDay.toDateString();

      setDoneMap((prev) => {
        const arr = Array.isArray(prev[dayStr]) ? [...prev[dayStr]] : [];
        arr[idx] = !arr[idx];

        return {
          ...prev,
          [dayStr]: arr,
        };
      });
    }
  };

  const infoBoxDayType: DayType = selectedType;
  const infoBoxEvents: string[] = selectedEvents;
  const infoBoxDate: Date = selectedDay ?? today;
  const infoBoxDoneMap: boolean[] = doneMap[selectedString] || [];

  const isToday = selectedDay
    ? selectedDay.toDateString() === todayString
    : true;

  const selectedStats = React.useMemo(() => {
    const str = selectedDay ? selectedDay.toDateString() : today.toDateString();
    const eventsList = events[str] || [];
    const doneList = doneMap[str] || [];

    let completed = 0;
    let left = 0;

    eventsList.forEach((task, i) => {
      if (doneList[i]) completed++;
      else left++;
    });

    return { completed, left };
  }, [selectedDay, events, doneMap, today]);

  const thisMonthStats = React.useMemo(() => {
    const ref = selectedDay ?? today;
    const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    return getTodoCoverageStats(doneMap, events, { start, end });
  }, [selectedDay, events, doneMap, today]);

  const thisYearStats = React.useMemo(() => {
    const ref = selectedDay ?? today;
    const start = new Date(ref.getFullYear(), 0, 1);
    const end = new Date(ref.getFullYear(), 11, 31);
    return getTodoCoverageStats(doneMap, events, { start, end });
  }, [selectedDay, events, doneMap, today]);

  const mockDays = days;

  const modifiers = {
    work: Object.keys(mockDays)
      .filter((d) => mockDays[d] === "work")
      .map((d) => new Date(d)),
    vacation: Object.keys(mockDays)
      .filter((d) => mockDays[d] === "vacation")
      .map((d) => new Date(d)),
    sickness: Object.keys(mockDays)
      .filter((d) => mockDays[d] === "sickness")
      .map((d) => new Date(d)),
    today: [today],
  };

  const totalTasks = selectedStats.completed + selectedStats.left;
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((selectedStats.completed / totalTasks) * 100);

  return (
    <main 
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text)" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7C3AED22,transparent_35%),radial-gradient(circle_at_bottom_right,#06B6D422,transparent_35%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>

            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
              Memora Dashboard
            </h1>

            <p className="text-[#94A3B8] mt-2">
              Track your tasks, plan your study day, and keep revision moving.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Action Area */}
          <section className="lg:col-span-2 space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon={<CheckCircle2 size={22} />}
                title="Completed Today"
                value={selectedStats.completed}
                subtitle={`${selectedStats.left} tasks left`}
                accent="violet"
              />
              <StatCard
                icon={<Target size={22} />}
                title="Completion Rate"
                value={`${completionRate}%`}
                subtitle="Selected day progress"
                accent="cyan"
              />
            </div>

            {/* Calendar and Today's Tasks */}
            <Card className="bg-[#161B22]/90 border-[#2D3748] text-white rounded-3xl shadow-2xl overflow-hidden">
              <CardHeader className="bg-[#0D1117]/50 border-b border-[#2D3748]">
                <CardTitle className="flex items-center gap-2 text-2xl font-black">
                  <CalendarDays className="text-[#A78BFA]" size={26} />
                  Study Calendar & Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col xl:flex-row gap-6 p-6">
                <div className="bg-[#0D1117]/70 border border-[#2D3748] rounded-3xl p-4 flex flex-col items-center">
                  <Calendar
                    mode="single"
                    selected={selectedDay || date}
                    onSelect={handleCalendarSelect}
                    month={displayMonth}
                    onMonthChange={setDisplayMonth}
                    className="rounded-2xl pointer-events-auto text-white"
                    modifiers={modifiers}
                    modifiersClassNames={{
                      work: "bg-[#7C3AED]/20 text-[#A78BFA] rounded-md",
                      vacation: "bg-[#334155]/40 text-[#CBD5E1] rounded-md",
                      sickness: "bg-[#06B6D4]/20 text-[#06B6D4] rounded-md",
                      today:
                        "ring-2 ring-[var(--app-accent)] ring-offset-2 ring-offset-[#0D1117] font-bold rounded-md",
                    }}
                  />

                  <div className="flex gap-4 mt-4 px-2 text-xs items-center text-[#94A3B8]">
                    <Legend color="#7C3AED" label="Work" />
                    <Legend color="#334155" label="Vacation" />
                    <Legend color="#06B6D4" label="Sick" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="rounded-3xl border border-[#2D3748] bg-[#0D1117]/70 p-4 h-full">
                    <TodayInfoBox
                      dayType={infoBoxDayType}
                      events={selectedEvents}
                      date={infoBoxDate}
                      doneMap={infoBoxDoneMap}
                      onToggleDone={handleToggleDone}
                      isToday={isToday}
                      isSelected={true}
                      onDayTypeChange={handleDayTypeChange}
                      onAddEvent={(taskStr: string) => {
                        handleAddEvent(taskStr);
                      }}
                      onRemoveEvent={enhancedHandleRemoveEvent}
                      onAddTasks={(tasks: string[]) => {
                        tasks.forEach((task) =>
                          handleAddEvent(task)
                        );
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Area moved below Calendar */}
            <DashboardStatsCard
              stats={[
                {
                  title: selectedDay
                    ? `Selected (${selectedDay.toLocaleDateString('en-GB')})`
                    : `Today (${today.toLocaleDateString('en-GB')})`,
                  stat: selectedStats,
                  color: "#7C3AED",
                },
                {
                  title: `Month (${(selectedDay ?? today).toLocaleString(
                    undefined,
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )})`,
                  stat: thisMonthStats,
                  color: "#06B6D4",
                },
                {
                  title: `Year (${(selectedDay ?? today).getFullYear()})`,
                  stat: thisYearStats,
                  color: "#7C3AED",
                },
              ]}
            />

          </section>

          {/* Right Sidebar - Stats & Profile */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#2D3748] bg-[#161B22]/90 shadow-2xl overflow-hidden">
              <ProfileCard
                userId={userId}
                totalTasks={selectedStats.completed + selectedStats.left}
              />
            </div>

            {/* Quick Add */}
            <Card className="bg-[#161B22]/90 border-[#2D3748] text-white rounded-3xl shadow-2xl">
              <CardHeader className="bg-[#0D1117]/50 border-b border-[#2D3748]">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="text-[#06B6D4]" size={22} />
                  Quick Add Task
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as any).elements.namedItem('quickAddInput');
                    if (input.value.trim()) {
                      handleAddEvent(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    name="quickAddInput"
                    placeholder="Type a task and hit enter..."
                    className="flex-1 bg-[#0D1117] border border-[#2D3748] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Add
                  </button>
                </form>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-[#161B22]/90 border-[#2D3748] text-white rounded-3xl shadow-2xl">
              <CardHeader className="bg-[#0D1117]/50 border-b border-[#2D3748]">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarClock className="text-[#7C3AED]" size={22} />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as any;
                    const textValue = form.elements.namedItem('eventInput').value.trim();
                    const date = form.elements.namedItem('eventDate').value;
                    const time = form.elements.namedItem('eventTime').value;
                    if (textValue) {
                      const events = textValue.split('\n').map((s: string) => s.trim()).filter(Boolean);
                      events.forEach((text: string) => {
                        handleAddUpcomingEvent(text, date, time);
                      });
                      form.reset();
                    }
                  }}
                  className="flex flex-col gap-3 mb-6"
                >
                  <textarea
                    name="eventInput"
                    rows={2}
                    placeholder="Event name (e.g., Final Exams)&#10;Add multiple on new lines"
                    className="w-full bg-[#0D1117] border border-[#2D3748] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors resize-y"
                    required
                  />
                  <div className="flex gap-2">
                    <input
                      name="eventDate"
                      type="date"
                      className="flex-1 bg-[#0D1117] border border-[#2D3748] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors [color-scheme:dark]"
                    />
                    <input
                      name="eventTime"
                      type="time"
                      className="w-28 bg-[#0D1117] border border-[#2D3748] rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors [color-scheme:dark]"
                    />
                    <button
                      type="submit"
                      className="bg-[#06B6D4] hover:bg-[#0891B2] text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-center text-sm text-[#94A3B8] py-4">No upcoming events!</p>
                  ) : (
                    upcomingEvents
                      .sort((a, b) => {
                        if (!a.date) return 1;
                        if (!b.date) return -1;
                        return new Date(a.date).getTime() - new Date(b.date).getTime();
                      })
                      .map((event) => {
                        let daysLeftText = "";
                        if (event.date) {
                          const eventDate = new Date(event.date);
                          eventDate.setHours(0, 0, 0, 0);
                          const todayNow = new Date();
                          todayNow.setHours(0, 0, 0, 0);
                          const diffTime = eventDate.getTime() - todayNow.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays === 0) daysLeftText = "Today!";
                          else if (diffDays === 1) daysLeftText = "Tomorrow";
                          else if (diffDays > 1) daysLeftText = `in ${diffDays} days`;
                          else daysLeftText = "Passed";
                        }

                        let formattedTime = "";
                        if (event.time) {
                          const [hourStr, minuteStr] = event.time.split(":");
                          let hour = parseInt(hourStr, 10);
                          const ampm = hour >= 12 ? "PM" : "AM";
                          hour = hour % 12 || 12;
                          formattedTime = `${hour}:${minuteStr} ${ampm}`;
                        }

                        return (
                          <div key={event._id} className="flex items-center justify-between bg-[#0D1117]/80 border border-[#2D3748] rounded-2xl px-4 py-3 group">
                            <div className="flex flex-col">
                              <span className="text-[#F8FAFC] font-medium">{event.text}</span>
                              {event.date && (
                                <span className={`text-xs ${daysLeftText === "Today!" || daysLeftText === "Tomorrow" ? "text-yellow-400 font-semibold" : "text-[#94A3B8]"}`}>
                                  {new Date(event.date).toLocaleDateString('en-GB')} {formattedTime && `at ${formattedTime}`} {daysLeftText && `• ${daysLeftText}`}
                                </span>
                              )}
                              {!event.date && formattedTime && (
                                <span className="text-xs text-[#94A3B8]">
                                  {formattedTime}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteUpcomingEvent(event._id)}
                              className="text-[#94A3B8] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Remove Event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
};

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  accent: "violet" | "cyan" | "green";
}) => {
  const accentMap = {
    violet: "bg-[#7C3AED]/10 text-[#A78BFA] border-[#7C3AED]/30",
    cyan: "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30",
    green: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
  };

  return (
    <div className="rounded-3xl border border-[#2D3748] bg-[#161B22]/90 p-6 shadow-2xl">
      <div
        className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 ${accentMap[accent]}`}
      >
        {icon}
      </div>
      <p className="text-[#94A3B8] text-sm">{title}</p>
      <h3 className="text-4xl font-black mt-1">{value}</h3>
      <p className="text-[#94A3B8] text-sm mt-2">{subtitle}</p>
    </div>
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => {
  return (
    <span className="flex gap-2 items-center">
      <span
        className="w-3 h-3 inline-block rounded-md"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
};

export default Dashboard;