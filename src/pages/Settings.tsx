import React, { useState, useEffect, useRef } from "react";
import {
  User, Lock, Camera, Save, Eye, EyeOff, CheckCircle, AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const Settings = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [originalProfile, setOriginalProfile] = useState({ name: "", email: "", profilePhoto: "" });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Active section
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        setName(data.name || "");
        setEmail(data.email || "");
        setProfilePhoto(data.profilePhoto || null);
        setOriginalProfile({
          name: data.name || "",
          email: data.email || "",
          profilePhoto: data.profilePhoto || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Profile photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save profile
  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProfileLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, profilePhoto }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update profile");
      }

      setOriginalProfile({ name, email, profilePhoto: profilePhoto || "" });
      toast({ title: "Profile updated", description: "Your profile has been saved successfully." });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast({ title: "Error", description: err.message || "Failed to update profile.", variant: "destructive" });
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setPasswordLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/profile/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to change password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password changed", description: "Your password has been updated successfully." });
    } catch (err: any) {
      console.error("Error changing password:", err);
      toast({ title: "Error", description: err.message || "Failed to change password.", variant: "destructive" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const hasProfileChanges =
    name !== originalProfile.name ||
    email !== originalProfile.email ||
    profilePhoto !== originalProfile.profilePhoto;

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthLabels = ["", "Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

  return (
    <main 
      className="min-h-screen"
      style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text)" }}
    >
      {/* Header */}
      <div 
        className="border-b"
        style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)" }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        {/* Tab navigation */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            onClick={() => setActiveTab("profile")}
            className={`gap-2 rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                : "border-[#2D3748] bg-[#161B22] text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </Button>
          <Button
            variant={activeTab === "security" ? "default" : "outline"}
            onClick={() => setActiveTab("security")}
            className={`gap-2 rounded-xl transition-all ${
              activeTab === "security"
                ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                : "border-[#2D3748] bg-[#161B22] text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
            }`}
          >
            <Lock className="w-4 h-4" />
            Security
          </Button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card className="bg-[#161B22]/90 border border-[#2D3748] rounded-3xl shadow-2xl text-[#F8FAFC]">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>

              {/* Profile Photo */}
              <div className="flex items-center gap-6 mb-8">
                <div
                  className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#7C3AED]/30 cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-3xl font-bold text-white">
                      {name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">{name || "Your Name"}</p>
                  <p className="text-sm text-[#94A3B8]">{email || "your@email.com"}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#A78BFA] hover:text-[#7C3AED] mt-1 transition-colors"
                  >
                    Change photo
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {/* Name */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-[#94A3B8]">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-[#0D1117] border-[#2D3748] text-[#F8FAFC] rounded-xl focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                />
              </div>

              {/* Email */}
              <div className="space-y-2 mb-8">
                <label className="text-sm font-medium text-[#94A3B8]">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-[#0D1117] border-[#2D3748] text-[#F8FAFC] rounded-xl focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                />
              </div>

              {/* Save button */}
              <Button
                onClick={handleSaveProfile}
                disabled={!hasProfileChanges || profileLoading}
                className="gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl disabled:opacity-40"
              >
                {profileLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {profileLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <Card className="bg-[#161B22]/90 border border-[#2D3748] rounded-3xl shadow-2xl text-[#F8FAFC]">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-6">Change Password</h2>

              {/* Current Password */}
              <div className="space-y-2 mb-5">
                <label className="text-sm font-medium text-[#94A3B8]">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-[#0D1117] border-[#2D3748] text-[#F8FAFC] rounded-xl pr-10 focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2 mb-5">
                <label className="text-sm font-medium text-[#94A3B8]">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-[#0D1117] border-[#2D3748] text-[#F8FAFC] rounded-xl pr-10 focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength */}
                {newPassword.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: i <= passwordStrength ? strengthColors[passwordStrength] : "#1E293B",
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strengthColors[passwordStrength] }}>
                      {strengthLabels[passwordStrength]}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                <div className="mt-3 space-y-1">
                  {[
                    { test: newPassword.length >= 8, label: "At least 8 characters" },
                    { test: /[A-Z]/.test(newPassword), label: "One uppercase letter" },
                    { test: /[a-z]/.test(newPassword), label: "One lowercase letter" },
                    { test: /\d/.test(newPassword), label: "One number" },
                    { test: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword), label: "One special character" },
                  ].map(({ test, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      {test ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-[#64748B]" />
                      )}
                      <span className={test ? "text-emerald-400" : "text-[#64748B]"}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 mb-8">
                <label className="text-sm font-medium text-[#94A3B8]">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-[#0D1117] border-[#2D3748] text-[#F8FAFC] rounded-xl pr-10 focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> Passwords do not match
                  </p>
                )}
                {confirmPassword.length > 0 && newPassword === confirmPassword && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                onClick={handleChangePassword}
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword ||
                  passwordStrength < 5 ||
                  passwordLoading
                }
                className="gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl disabled:opacity-40"
              >
                {passwordLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default Settings;