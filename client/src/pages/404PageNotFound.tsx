import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center shadow-xl backdrop-blur-md space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-100">404</h1>
        <p className="text-base text-slate-400">
          Oops! The page you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Go to Home Page
        </button>
      </div>
    </div>
  );
}
