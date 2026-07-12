"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/authstore";
import { toast } from "sonner";
import logo from "../../assets/images/logo.png";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const {
    pendingAction,
    pendingEmail,
    verifyRegisterOtp,
    verifyLoginOtp,
    resendOtp,
    getOtpCooldown,
    user,
    isHR,
  } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setHydrated(true);
  }, []);

  // 🛡️ Redirect if no pending action
  useEffect(() => {
    if (!hydrated) return;
    if (!pendingAction || !pendingEmail) {
      router.push("/login");
    }
  }, [pendingAction, pendingEmail, router, hydrated]);

  // 🕒 Initialize timer from backend TTL
  useEffect(() => {
    if (!pendingAction || !pendingEmail) return;

    (async () => {
      const remaining = await getOtpCooldown();
      setTimer(remaining);
    })();
  }, [pendingAction, pendingEmail]);

  // 🕒 Countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    console.log(pendingAction);
    console.log(pendingEmail);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    if (!pendingAction) {
      toast.error("No pending verification!");
      return;
    }

    setIsVerifying(true);
    const toastId = toast.loading("Verifying OTP...");

    let res;
    if (pendingAction === "register") res = await verifyRegisterOtp(otpString);
    else if (pendingAction === "login") res = await verifyLoginOtp(otpString);

    setIsVerifying(false);

    if (res.ok) {
      toast.success(res.message, { id: toastId });
      router.push("/dashboard");
    } else {
      toast.error(res.message, { id: toastId });
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    const toastId = toast.loading("Resending OTP...");

    const res = await resendOtp();

    setIsResending(false);

    if (res.ok) {
      toast.success("New OTP sent!", { id: toastId });
      const remaining = await getOtpCooldown();
      setTimer(remaining);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      toast.error(res.msg, { id: toastId });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pendingAction || !pendingEmail) {
    return null;
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="w-full h-full absolute z-[-1]">
        <img className="w-full h-full" src="/signup.png" alt="" />
      </div>
      <div className="relative z-10 h-full flex items-center justify-center p-4">
        <div className="w-full max-w-md">
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
            <div>
              <h1 className="text-3xl font-bold text-center text-white/90 mb-3 product">
                OTP Verification
              </h1>
              <p className="text-center text-white/50 mb-8 product">
                Enter the 6-digit code from your email to verify your identity.
              </p>
            </div>

            {/* OTP Input */}
            <form onSubmit={handleSubmit}>
              <div className="flex gap-2 md:gap-3 justify-center mb-8">
                {otp.map((digit, index) => (
                  <div key={index}>
                    <input
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      disabled={isVerifying}
                      className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl text-white font-bold border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-purple-100 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {index === 2 && (
                      <span className="inline-block w-3 text-center text-gray-400 font-bold">
                        -
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isVerifying || otp.some((d) => !d)}
                className="primary-button cta-button"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify"
                )}
              </button>
            </form>

            {/* Resend Section */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-gray-600">
                  We can resend the code in{" "}
                  <span className="font-bold text-blue-600">
                    {formatTime(timer)}
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-blue-600 font-semibold hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors product"
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </div>

            {/* Email Info */}
            <p className="text-center text-sm text-gray-400 mt-6">
              OTP sent to{" "}
              <span className="font-medium text-gray-600">{pendingEmail}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
