import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Brain, BookOpen, Eye, EyeOff, Sparkles, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const Login = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(formData.email) || !formData.password) {
      setError("Please enter a valid email and password");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Login Failed",
          description: "Try with correct credentials, please.",
        });
        throw new Error(data?.msg || "Login failed");
      }

      localStorage.setItem("token", data.token);

      toast({
        title: "Welcome back",
        description: "You have successfully logged in.",
      });

      window.location.reload();
    } catch (error: any) {
      setError(error.message || "Login error");
    }
  };

  return (
    <main className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4 text-[#F8FAFC]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7C3AED33,transparent_35%),radial-gradient(circle_at_bottom_right,#06B6D422,transparent_35%)]" />

      <div className="relative w-full max-w-6xl min-h-[680px] flex bg-[#161B22]/95 border border-[#2D3748] rounded-3xl shadow-2xl overflow-hidden">
        <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-10">
              <Link
                to="/"
                className="text-[#94A3B8] hover:text-white transition-colors text-xl"
              >
                ←
              </Link>

              <div className="text-sm text-[#94A3B8]">
                New here?{" "}
                <Link
                  to="/signup"
                  className="text-[#06B6D4] hover:text-[#7C3AED] font-semibold"
                >
                  Create account
                </Link>
              </div>
            </div>



            <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4">
              Welcome back
            </h1>

            <p className="text-[#94A3B8] text-lg">
              Continue your learning streak with Memora.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center bg-[#1C2128] rounded-2xl px-5 py-4 border border-[#2D3748] focus-within:border-[#06B6D4] transition-all">
              <span className="text-[#94A3B8] mr-3">📧</span>
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder-[#64748B]"
                required
              />
              {formData.email && isValidEmail(formData.email) && (
                <span className="text-[#22C55E] ml-2">✓</span>
              )}
            </div>

            <div className="flex items-center bg-[#1C2128] rounded-2xl px-5 py-4 border border-[#2D3748] focus-within:border-[#06B6D4] transition-all">
              <span className="text-[#94A3B8] mr-3">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder-[#64748B]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#94A3B8] ml-2 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-[#06B6D4] hover:text-[#A78BFA]"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={!isValidEmail(formData.email) || !formData.password}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-6 rounded-2xl text-lg font-black transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign In →
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

              <h2 className="text-3xl font-black mb-2">42 cards</h2>
              <p className="text-[#94A3B8] text-sm mb-5">
                Ready for revision today
              </p>

              <div className="w-full h-2 bg-[#2D3748] rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-[#06B6D4] rounded-full" />
              </div>

              <div className="mt-5 flex items-center">
                <div className="w-10 h-10 bg-[#7C3AED] rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-semibold">Revision streak</div>
                  <div className="text-xs text-[#94A3B8]">Keep it going</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0D1117]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-7 w-80 shadow-2xl">
              <div className="flex items-center mb-4">
                <Layers className="w-8 h-8 text-[#06B6D4] mr-3" />
                <div>
                  <h3 className="font-black text-white">
                    Learn. Recall. Repeat.
                  </h3>
                  <p className="text-sm text-[#94A3B8] mt-1">
                    Turn notes into long-term memory.
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

export default Login;
