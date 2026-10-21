import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import useAuthStore from "../store/useAuthstore";

export default function ForgotPasswordVerificationPage() {
  const [status, setStatus] = useState<
    "verifying" | "success" | "error" | "server_error"
  >("verifying");
  const [errorMessage, setErrorMessage] = useState<string>(
    "Verification failed.",
  );

  const { verifyResetToken } = useAuthStore();
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
      setErrorMessage("Missing recovery token in URL.");
      return;
    }

    verifyResetToken(token).then((res) => {
      if (res.status === 200) {
        setStatus("success");
        setTimeout(() => {
          navigate(`/update-password?token=${token}`);
        }, 2000);
      } else if (res.status === 500) {
        setStatus("server_error");
        setTimeout(() => {
          navigate("/forgot-password");
        }, 3000);
      } else {
        setStatus("error");
        setErrorMessage(res.data?.message || "Verification failed.");
      }
    });
  }, [location, navigate, verifyResetToken]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300 text-center p-8">
        <div className="card-body items-center text-center">
          {status === "verifying" && (
            <div className="space-y-4 py-6">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-lg font-semibold text-base-content">
                Verifying
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4 py-6">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto animate-bounce" />
              <h2 className="text-xl font-bold text-success">Success!</h2>
              <p className="text-sm text-base-content/70">
                Redirecting to password reset...
              </p>
            </div>
          )}

          {status === "server_error" && (
            <div className="space-y-4 py-6">
              <p className="text-error font-medium text-base">
                An unexpected error occured. Please try again later.
              </p>
              <p className="text-xs text-base-content/60">
                Redirecting to forgot password page...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6 py-4">
              <p className="text-error font-medium text-base">{errorMessage}</p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="btn btn-primary w-full"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
