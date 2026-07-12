"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/authstore";
import { toast } from "sonner";
import logo from "../../assets/images/logo.png";
import { div } from "framer-motion/client";
import "../../styles/login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const loginWithPassword = useAuthStore((s) => s.login);
  const router = useRouter();

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({ email: "", password: "" });

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    const toastId = toast.loading("Sending OTP...");

    const res = await loginWithPassword(email, password);

    setIsLoading(false);

    if (res.ok) {
      toast.success("OTP sent to your email!", { id: toastId });
      router.push("/verify-otp");
    } else {
      toast.error(res.message, { id: toastId });
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="w-full h-full absolute z-[-1]">
        <img className="w-full h-full object-cover" src="/hero.png" alt="" />
      </div>
      <div className="relative z-10 h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Glass Card */}
          <div className="backdrop-blur-xl bg-black/10 rounded-2xl border border-white/20 shadow-2xl p-8 space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="flex gap-2 items-center">
                <img src={logo.src} alt="Logo" className="w-8 h-8 invert" />
                <h1 className="text-2xl font-bold text-white tracking-wider radio">
                  Odoo
                </h1>
              </div>
            </div>

            {/* Header */}
            <div className="text-center space-y-2">
              {/* <h2 className="text-lg text-white product">Welcome Back</h2> */}
              <p className="text-white/70 product">Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 product">
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/90"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 rounded-sm border backdrop-blur-md bg-white/10 text-white placeholder:text-white/50 ${
                    errors.email
                      ? "border-red-400 focus:ring-red-400"
                      : "border-white/30 focus:ring-[#f2edff] focus:border-[#f2edff]"
                  } focus:ring-1 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.email && (
                  <span className="text-red-300 text-sm flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white/90"
                >
                  Password
                </label>
                <input
                  id="password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 rounded-sm border backdrop-blur-md bg-white/10 text-white placeholder:text-white/50 ${
                    errors.password
                      ? "border-red-400 focus:ring-red-400"
                      : "border-white/30 focus:ring-[#f2edff] focus:border-[#f2edff]"
                  } focus:ring-1 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.password && (
                  <span className="text-red-300 text-sm flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="primary-button cta-button"
              >
                {isLoading ? <>Sending OTP...</> : "Login"}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center product text-sm text-white/70">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-[#8579ed] hover:text-[#d6d1ff] font-semibold transition-colors"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
