

import { LogOut } from "lucide-react";
import { useState } from "react";

const FancyLogoutButton = () => {
  const [isClicked, setIsClicked] = useState(false);

  const handleLogout = () => {
    setIsClicked(true);
    localStorage.removeItem("token");

    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isClicked}
      className={`
        group relative overflow-hidden
        px-5 py-2 rounded-xl
        bg-[#161B22]
        hover:bg-[#7C3AED]/20
        text-[#F8FAFC] font-semibold text-sm
        transition-all duration-300
        border border-[#2D3748]
        hover:border-[#7C3AED]/50
        shadow-lg
        disabled:opacity-70 disabled:cursor-not-allowed
        ${isClicked ? "animate-pulse" : ""}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/0 via-[#7C3AED]/20 to-[#06B6D4]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-center justify-center gap-2">
        <LogOut
          size={16}
          className={`
            text-[#06B6D4]
            transition-all duration-300
            ${isClicked ? "rotate-180" : "rotate-0"}
            group-hover:translate-x-1
          `}
        />

        <span className="transition-all duration-300 group-hover:translate-x-1">
          {isClicked ? "Logging out..." : "Logout"}
        </span>
      </div>

      {isClicked && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-[#06B6D4] rounded-full animate-bounce" />
            <div
              className="w-1 h-1 bg-[#06B6D4] rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1 h-1 bg-[#06B6D4] rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}
    </button>
  );
};

export default FancyLogoutButton;