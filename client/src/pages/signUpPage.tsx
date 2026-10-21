import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import useAuthStore from "../store/useAuthstore";
import toast from "react-hot-toast"; // or your preferred toast library

// Zod validation schema
const signUpSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .regex(
      /^[A-Za-z\s]+$/,
      "Full name must not contain numbers, special characters, or dots",
    ),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/(?=.*[0-9])/, "Password must contain at least one number")
    .regex(
      /(?=.*[^A-Za-z0-9])/,
      "Password must contain at least one special character",
    ),
  avatar: z.any().optional(),
  coverImage: z.any().optional(),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const { signUp, isSigningUp, signUpResponse } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("password", data.password);

    if (data.avatar?.[0]) {
      formData.append("avatar", data.avatar[0]);
    }
    if (data.coverImage?.[0]) {
      formData.append("coverImage", data.coverImage[0]);
    }

    const res = await signUp(formData);

    if (res?.status === 409) {
      toast.error(res.data.message || "Conflict error");
    } else if (res?.status === 200 || res?.status === 201) {
      reset();
    } else if (res?.status === 500) {
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl backdrop-blur-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Create an Account
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enter your details to get started
          </p>
        </div>

        {signUpResponse?.statusCode === 500 && (
          <div className="rounded-lg bg-red-950/50 border border-red-500/30 p-4 text-center">
            <p className="text-sm text-red-400 font-medium">
              Internal server error. Try again later.
            </p>
            <a
              href="/"
              className="mt-3 inline-block rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
            >
              Go to Home Page
            </a>
          </div>
        )}

        {signUpResponse?.success &&
        (signUpResponse.statusCode === 200 ||
          signUpResponse.statusCode === 201) ? (
          <div className="text-center py-6 space-y-3">
            <h2 className="text-xl font-semibold text-emerald-400">
              {signUpResponse.message}
            </h2>
            <p className="text-sm text-slate-400">
              Please check your email to verify your account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                disabled={isSigningUp}
                {...register("fullName")}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                disabled={isSigningUp}
                {...register("email")}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password *
              </label>
              <input
                type="password"
                disabled={isSigningUp}
                {...register("password")}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Profile Picture (Optional)
              </label>
              <input
                type="file"
                disabled={isSigningUp}
                {...register("avatar")}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white file:cursor-pointer hover:file:bg-indigo-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cover Image (Optional)
              </label>
              <input
                type="file"
                disabled={isSigningUp}
                {...register("coverImage")}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white file:cursor-pointer hover:file:bg-indigo-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full mt-2 flex items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Up...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
