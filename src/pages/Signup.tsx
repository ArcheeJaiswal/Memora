
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Brain,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const Signup = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    number: false,
    case: false,
    special: false,
  });

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");

    if (field === "password") {
      setPasswordRequirements({
        length: value.length >= 8,
        number: /\d/.test(value),
        case: /[a-z]/.test(value) && /[A-Z]/.test(value),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
      });
    }

    if (field === "email" && isEmailVerified) {
      setIsEmailVerified(false);
      setShowOtpSection(false);
      setOtp("");
    }
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone: string) =>
    /^\d{10}$/.test(phone.replace(/\D/g, ""));

  const isPasswordValid = () =>
    passwordRequirements.length &&
    passwordRequirements.number &&
    passwordRequirements.case &&
    passwordRequirements.special;

  const canProceed = () =>
    formData.name.trim() !== "" &&
    isValidEmail(formData.email) &&
    isValidPhone(formData.phone) &&
    isPasswordValid() &&
    formData.password === formData.confirmPassword &&
    isEmailVerified;

  const sendOtp = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    setIsOtpLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/otp/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send OTP");
      }

      setOtpTimer(60);
      setShowOtpSection(true);

      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${formData.email}`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setIsOtpLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Invalid OTP");
      }

      setIsEmailVerified(true);
      setShowOtpSection(false);
      setError("");

      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified!",
      });
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
      toast({
        title: "Verification Failed",
        description: err.message || "Invalid OTP. Please try again.",
      });
    } finally {
      setIsOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    setOtp("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/otp/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to resend OTP");
      }

      setOtpTimer(60);

      toast({
        title: "OTP Sent",
        description: "New verification code sent to your email",
      });
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to resend OTP. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canProceed()) {
      toast({
        title: "Incomplete Form",
        description: "Please complete all steps and verify your email",
      });
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.replace(/\D/g, ""),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          toast({
            title: "User Already Exists",
            description:
              "An account with this email already exists. Please try logging in.",
          });
          throw new Error("User already exists");
        }

        throw new Error(data?.msg || "Signup failed");
      }

      toast({
        title: "Account Created Successfully",
        description: "Welcome to Memora! You can now start learning.",
      });

      setSuccess("Account created successfully! You can now sign in.");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast({
        title: "Signup Failed",
        description: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4 text-[#F8FAFC]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7C3AED33,transparent_35%),radial-gradient(circle_at_bottom_right,#06B6D422,transparent_35%)]" />

      <div className="relative w-full max-w-6xl flex bg-[#161B22]/95 border border-[#2D3748] rounded-3xl shadow-2xl overflow-hidden">
        <div className="w-full lg:w-1/2 p-8 lg:p-14">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/"
                className="text-[#94A3B8] hover:text-white transition-colors text-xl"
              >
                ←
              </Link>

              <div className="text-sm text-[#94A3B8]">
                Already member?{" "}
                <Link
                  to="/login"
                  className="text-[#06B6D4] hover:text-[#A78BFA] font-semibold"
                >
                  Sign in
                </Link>
              </div>
            </div>



            <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4">
              Create account
            </h1>

            <p className="text-[#94A3B8] text-lg">
              Build your personal Memora and never forget what you learn.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl">
              <p className="text-[#22C55E] text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputBox
              icon="👤"
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={(value) => handleInputChange("name", value)}
              valid={!!formData.name.trim()}
            />

            <div>
              <div
                className={`flex items-center rounded-2xl px-5 py-4 border transition-all ${isEmailVerified
                    ? "bg-[#22C55E]/10 border-[#22C55E]/30"
                    : "bg-[#1C2128] border-[#2D3748] focus-within:border-[#06B6D4]"
                  }`}
              >
                <span
                  className={`mr-3 ${isEmailVerified ? "text-[#22C55E]" : "text-[#94A3B8]"
                    }`}
                >
                  📧
                </span>

                <input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder-[#64748B]"
                  disabled={isEmailVerified}
                  required
                />

                {isEmailVerified ? (
                  <CheckCircle className="w-5 h-5 text-[#22C55E] ml-2" />
                ) : (
                  formData.email &&
                  isValidEmail(formData.email) && (
                    <span className="text-[#22C55E] ml-2">✓</span>
                  )
                )}
              </div>

              {!isEmailVerified && isValidEmail(formData.email) && (
                <Button
                  type="button"
                  onClick={sendOtp}
                  disabled={isOtpLoading}
                  className="w-full mt-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-5 rounded-2xl font-black transition-all"
                >
                  {isOtpLoading ? "Sending OTP..." : "Verify Email →"}
                </Button>
              )}

              {showOtpSection && !isEmailVerified && (
                <div className="mt-4 space-y-4 p-5 bg-[#1C2128] rounded-2xl border border-[#06B6D4]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#06B6D4]/10 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#06B6D4]" />
                    </div>

                    <div>
                      <p className="text-white font-bold">Verify your email</p>
                      <p className="text-sm text-[#94A3B8]">
                        Code sent to{" "}
                        <span className="text-[#06B6D4]">
                          {formData.email}
                        </span>
                      </p>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full bg-[#0D1117] border border-[#2D3748] focus:border-[#06B6D4] rounded-2xl px-5 py-4 outline-none text-white placeholder-[#64748B] text-center text-xl tracking-[0.4em]"
                    maxLength={6}
                  />

                  <Button
                    type="button"
                    onClick={verifyOtp}
                    disabled={otp.length !== 6 || isOtpLoading}
                    className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-white py-5 rounded-2xl font-black transition-all"
                  >
                    {isOtpLoading ? "Verifying..." : "Verify Code"}
                  </Button>

                  <div className="text-center">
                    {otpTimer > 0 ? (
                      <p className="text-[#94A3B8] text-sm">
                        Resend code in {otpTimer}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={resendOtp}
                        className="text-[#06B6D4] hover:text-[#A78BFA] text-sm font-semibold"
                      >
                        Resend verification code
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <InputBox
              icon="📱"
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(value) => handleInputChange("phone", value)}
              valid={!!formData.phone && isValidPhone(formData.phone)}
              maxLength={10}
            />

            <PasswordBox
              placeholder="Password"
              value={formData.password}
              show={showPassword}
              setShow={setShowPassword}
              onChange={(value) => handleInputChange("password", value)}
            />

            {formData.password && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <Requirement
                  ok={passwordRequirements.length}
                  text="8+ characters"
                />
                <Requirement
                  ok={passwordRequirements.number}
                  text="One number"
                />
                <Requirement
                  ok={passwordRequirements.case}
                  text="Upper & lowercase"
                />
                <Requirement
                  ok={passwordRequirements.special}
                  text="Special character"
                />
              </div>
            )}

            <PasswordBox
              placeholder="Confirm password"
              value={formData.confirmPassword}
              show={showConfirmPassword}
              setShow={setShowConfirmPassword}
              onChange={(value) => handleInputChange("confirmPassword", value)}
              valid={
                !!formData.confirmPassword &&
                formData.password === formData.confirmPassword
              }
            />

            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <p className="text-sm text-red-300">Passwords do not match</p>
              )}

            <Button
              type="submit"
              disabled={!canProceed() || isLoading}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-6 rounded-2xl text-lg font-black transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account →"}
            </Button>
          </form>
        </div>

        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#312E81]">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-[#7C3AED] blur-2xl" />
            <div className="absolute bottom-20 left-16 w-56 h-56 rounded-full bg-[#06B6D4] blur-3xl" />
          </div>

          <div className="relative flex flex-col justify-center items-center w-full p-12 space-y-6">
            <div className="bg-[#0D1117]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-7 w-80 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[#06B6D4] text-sm font-bold">
                  Memora
                </span>
                <Brain className="w-6 h-6 text-[#A78BFA]" />
              </div>

              <h2 className="text-3xl font-black mb-2">89.7%</h2>

              <p className="text-[#94A3B8] text-sm mb-5">
                Average study retention after revision
              </p>

              <div className="w-full h-2 bg-[#2D3748] rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-[#06B6D4] rounded-full" />
              </div>

              <div className="mt-5 flex items-center">
                <div className="w-10 h-10 bg-[#7C3AED] rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>

                <div className="ml-3">
                  <div className="text-sm font-semibold">Smart flashcards</div>
                  <div className="text-xs text-[#94A3B8]">
                    Generated from your notes
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0D1117]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-7 w-80 shadow-2xl">
              <div className="flex items-center mb-4">
                <Layers className="w-8 h-8 text-[#06B6D4] mr-3" />

                <div>
                  <h3 className="font-black text-white">
                    Built for deep recall
                  </h3>
                  <p className="text-sm text-[#94A3B8] mt-1">
                    Upload notes, revise smarter, and track your progress.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-5">
                <div className="h-2 bg-[#7C3AED] rounded-full" />
                <div className="h-2 bg-[#06B6D4] rounded-full" />
                <div className="h-2 bg-[#2D3748] rounded-full" />
                <div className="h-2 bg-[#2D3748] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const InputBox = ({
  icon,
  type,
  placeholder,
  value,
  onChange,
  valid,
  maxLength,
}: {
  icon: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  valid?: boolean;
  maxLength?: number;
}) => {
  return (
    <div className="flex items-center bg-[#1C2128] rounded-2xl px-5 py-4 border border-[#2D3748] focus-within:border-[#06B6D4] transition-all">
      <span className="text-[#94A3B8] mr-3">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-white placeholder-[#64748B]"
        maxLength={maxLength}
        required
      />
      {valid && <span className="text-[#22C55E] ml-2">✓</span>}
    </div>
  );
};

const PasswordBox = ({
  placeholder,
  value,
  show,
  setShow,
  onChange,
  valid,
}: {
  placeholder: string;
  value: string;
  show: boolean;
  setShow: (value: boolean) => void;
  onChange: (value: string) => void;
  valid?: boolean;
}) => {
  return (
    <div className="flex items-center bg-[#1C2128] rounded-2xl px-5 py-4 border border-[#2D3748] focus-within:border-[#06B6D4] transition-all">
      <span className="text-[#94A3B8] mr-3">🔒</span>

      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-white placeholder-[#64748B]"
        required
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-[#94A3B8] ml-2 hover:text-white transition-colors"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>

      {valid && <span className="text-[#22C55E] ml-2">✓</span>}
    </div>
  );
};

const Requirement = ({ ok, text }: { ok: boolean; text: string }) => {
  return (
    <div className={`flex items-center ${ok ? "text-[#22C55E]" : "text-[#94A3B8]"}`}>
      <span className="mr-2">{ok ? "✓" : "•"}</span>
      <span>{text}</span>
    </div>
  );
};

export default Signup;
