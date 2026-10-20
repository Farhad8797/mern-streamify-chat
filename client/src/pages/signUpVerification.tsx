import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axiosInstance from "../lib/axios";

export default function VerifySignUpEmailPage() {
  const [status, setStatus] = useState<
    "verifying" | "success" | "error" | "server_error"
  >("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("Verification token is missing.");
      return;
    }

    axiosInstance
      .get(`/verify-signup-email?token=${token}`)
      .then((res) => {
        if (res.status === 200) {
          setStatus("success");
          setTimeout(() => {
            navigate("/sign-in");
          }, 2000);
        }
      })
      .catch((err) => {
        const statusCode = err.response?.status;
        if (statusCode === 400) {
          setStatus("error");
          setErrorMessage(
            err.response?.data?.message || "Invalid or expired token.",
          );
        } else if (statusCode === 500) {
          setStatus("server_error");
        } else {
          setStatus("error");
          setErrorMessage("An unexpected error occurred.");
        }
      });
  }, [location, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center shadow-xl backdrop-blur-md">
        {status === "verifying" && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-500" />
            <p className="text-base font-medium text-slate-200">Verifying...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <p className="text-base font-medium text-emerald-400">
              Email verified successfully! Redirecting to sign in...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <p className="text-base font-medium text-red-400">{errorMessage}</p>
            <a
              href="/signin"
              className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Go to Sign In
            </a>
          </div>
        )}

        {status === "server_error" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-950/50 border border-red-500/30 p-4">
              <p className="text-sm text-red-400 font-medium">
                Internal server error. Try again later.
              </p>
            </div>
            <a
              href="/"
              className="inline-block rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
            >
              Go to Home Page
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
