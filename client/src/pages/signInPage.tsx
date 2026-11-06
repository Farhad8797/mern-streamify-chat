import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import useAuthStore from "../store/useAuthstore";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { connectSocket } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const response = await axiosInstance.post("/sign-in", data);

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data?.message || "Signed in successfully!");
        await checkAuth();
        connectSocket();
        navigate("/");
        console.log("Signed In!");
      }
    } catch (err: any) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message || "An unexpected error occurred.";

      if (status === 400 || status === 401) {
        toast.error(message);
      } else if (status === 500) {
        toast.error("Internal server error. Try again later.");
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center text-base-content mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-sm text-base-content/70 mb-6">
            Sign in to access your chat workspace
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
            <div className="form-control ">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <label
                className={`input input-bordered flex items-center gap-2 w-full ${
                  errors.email ? "input-error" : ""
                }`}
              >
                <Mail className="w-4 h-4 text-base-content/50" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                  className="grow text-sm"
                  {...register("email")}
                />
              </label>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error font-medium">
                    {errors.email.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <label
                className={`input input-bordered flex items-center gap-2 w-full ${
                  errors.password ? "input-error" : ""
                }`}
              >
                <Lock className="w-4 h-4 text-base-content/50" />
                <input
                  type="password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="grow text-sm"
                  {...register("password")}
                />
              </label>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error font-medium">
                    {errors.password.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-6 ">
            <p className="text-sm text-base-content/70">
              Not registered?{" "}
              <Link
                to="/sign-up"
                className="link-primary font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
          <Link
            className="text-center link-primary hover:link-secondary font-semibold"
            to="/forgot-password"
          >
            Forgot password ?
          </Link>
        </div>
      </div>
    </div>
  );
}
