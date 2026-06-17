
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Shield, Eye, EyeOff, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ForgotPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isPasswordValid = (value: string) =>
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(value);

  const sendOtp = async () => {
    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const checkResponse = await fetch(`${API_URL}/api/auth/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!checkResponse.ok) {
        toast({
          title: "User doesn't exist",
          description: "Please enter a valid email address or sign up first",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${API_URL}/api/otp/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.msg || "Failed to send OTP");
      }

      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code",
      });

      setStep(2);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to verify OTP");
      }

      setResetToken(data?.token || otp);

      toast({
        title: "OTP Verified",
        description: "You can now reset your password",
      });

      setStep(3);
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!isPasswordValid(password)) {
      toast({
        title: "Invalid Password",
        description: "Password must meet all requirements",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.msg || "Failed to reset password");
      }

      toast({
        title: "Password Reset Successfully",
        description: "You can now login with your new password",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isOtpComplete = otp.length === 6;
  const isFormValid =
    isPasswordValid(password) && password === confirmPassword;

  return (
    <main className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4 text-[#F8FAFC]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7C3AED33,transparent_35%),radial-gradient(circle_at_bottom_right,#06B6D422,transparent_35%)]" />

      <div className="relative w-full max-w-6xl min-h-[650px] flex bg-[#161B22]/95 border border-[#2D3748] rounded-3xl shadow-2xl overflow-hidden">
        <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center">
          <div className="mb-8">
            <Link
              to="/login"
              className="text-[#94A3B8] hover:text-white transition-colors flex items-center mb-8"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to login
            </Link>



            <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4">
              {step === 1 && "Reset password"}
              {step === 2 && "Verify email"}
              {step === 3 && "New password"}
            </h1>

            <p className="text-[#94A3B8] text-lg">
              {step === 1 && "Enter your email and we’ll send you a verification code."}
              {step === 2 && `Enter the 6-digit code sent to ${email}.`}
              {step === 3 && "Create a strong new password for your account."}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center bg-[#1C2128] rounded-2xl px-5 py-4 border border-[#2D3748] focus-within:border-[#06B6D4] transition-all">
                <Mail className="text-[#94A3B8] mr-3" size={20} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder-[#64748B]"
                />
                {email && isValidEmail(email) && (
                  <span className="text-[#22C55E] ml-2">✓</span>
                )}
              </div>

              <Button
                onClick={sendOtp}
                disabled={!isValidEmail(email) || isLoading}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-6 rounded-2xl text-lg font-black transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Verification Code →"}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-[#1C2128] border border-[#06B6D4]/30 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-[#06B6D4]/10 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#06B6D4]" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Check your inbox</p>
                    <p className="text-sm text-[#94A3B8]">{email}</p>
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
              </div>

              <Button
                onClick={verifyOtp}
                disabled={!isOtpComplete || isLoading}
                className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-white py-6 rounded-2xl text-lg font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify Code →"}
              </Button>

              <button
                onClick={sendOtp}
                disabled={isLoading}
                className="w-full text-sm text-[#06B6D4] hover:text-[#A78BFA] font-semibold"
              >
                Resend verification code
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <PasswordInput
                placeholder="New password"
                value={password}
                show={showPassword}
                setShow={setShowPassword}
                onChange={setPassword}
              />

              {password && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <Requirement ok={password.length >= 8} text="8+ characters" />
                  <Requirement ok={/[A-Z]/.test(password)} text="Uppercase" />
                  <Requirement ok={/[a-z]/.test(password)} text="Lowercase" />
                  <Requirement ok={/\d/.test(password)} text="One number" />
                  <Requirement
                    ok={/[!@#$%^&*(),.?":{}|<>]/.test(password)}
                    text="Special character"
                  />
                </div>
              )}

              <PasswordInput
                placeholder="Confirm new password"
                value={confirmPassword}
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                onChange={setConfirmPassword}
              />

              {confirmPassword && (
                <p
                  className={`text-sm ${password === confirmPassword
                      ? "text-[#22C55E]"
                      : "text-red-300"
                    }`}
                >
                  {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}

              <Button
                onClick={resetPassword}
                disabled={!isFormValid || isLoading}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-6 rounded-2xl text-lg font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting..." : "Reset Password →"}
              </Button>
            </div>
          )}
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
                  Secure Reset
                </span>
                <Shield className="w-6 h-6 text-[#A78BFA]" />
              </div>

              <h2 className="text-3xl font-black mb-2">3 steps</h2>
              <p className="text-[#94A3B8] text-sm mb-5">
                Verify your email and safely create a new password.
              </p>

              <div className="flex items-center gap-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={`h-2 flex-1 rounded-full ${step >= item ? "bg-[#06B6D4]" : "bg-[#2D3748]"
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-[#0D1117]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-7 w-80 shadow-2xl">
              <div className="flex items-center mb-4">
                <Lock className="w-8 h-8 text-[#06B6D4] mr-3" />
                <div>
                  <h3 className="font-black text-white">Protected recovery</h3>
                  <p className="text-sm text-[#94A3B8] mt-1">
                    OTP verification keeps your Memora account safe.
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

const PasswordInput = ({
  placeholder,
  value,
  show,
  setShow,
  onChange,
}: {
  placeholder: string;
  value: string;
  show: boolean;
  setShow: (value: boolean) => void;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="flex items-center bg-[#1C2128] rounded-2xl px-5 py-4 border border-[#2D3748] focus-within:border-[#06B6D4] transition-all">
      <Lock className="text-[#94A3B8] mr-3" size={20} />
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-white placeholder-[#64748B]"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-[#94A3B8] ml-2 hover:text-white transition-colors"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
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

export default ForgotPassword;
