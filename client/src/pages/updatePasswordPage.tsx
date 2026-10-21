import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthstore";
import { useState } from "react";

// Zod schema with match check, min length 8, 1 number, and 1 special character
const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[0-9]/, "Password must contain at least 1 number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least 1 special character",
      ),
    confirmPassword: z.string().min(1, "Please re-write your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordPage() {
  const { updatePassword, isUpdatingPassword } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async (data: UpdatePasswordFormData) => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (!token) {
      toast.error("Missing reset token in URL.");
      return;
    }

    const res = await updatePassword(
      data.password,
      data.confirmPassword,
      token,
    );

    if (res.status === 200) {
      toast.success(res.data?.message || "Password updated successfully!");
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/sign-in");
      }, 4000);
    } else if (res.status === 500) {
      toast.error("An unexpected error occured. Try again later.");
    } else {
      toast.error(res.data?.message || "Failed to update password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          {isSuccess ? (
            /* Success View */
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto animate-bounce" />
              <h2 className="text-2xl font-bold text-success">Success!</h2>
              <p className="text-base font-medium text-base-content">
                Password updated successfully
              </p>
              <p className="text-xs text-base-content/60">
                Redirecting to sign-in page...
              </p>
            </div>
          ) : (
            <>
              <h2 className="card-title text-2xl font-bold justify-center text-base-content mb-2 text-center">
                Set New Password
              </h2>
              <p className="text-center text-sm text-base-content/70 mb-6">
                Enter your new password below. Must be at least 8 characters
                with 1 number and 1 special character.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">New Password</span>
                  </label>
                  <label
                    className={`input input-bordered flex items-center gap-2 ${
                      errors.password ? "input-error" : ""
                    }`}
                  >
                    <Lock className="w-4 h-4 text-base-content/50" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      disabled={isUpdatingPassword}
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

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">
                      Confirm Password
                    </span>
                  </label>
                  <label
                    className={`input input-bordered flex items-center gap-2 ${
                      errors.confirmPassword ? "input-error" : ""
                    }`}
                  >
                    <Lock className="w-4 h-4 text-base-content/50" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      disabled={isUpdatingPassword}
                      className="grow text-sm"
                      {...register("confirmPassword")}
                    />
                  </label>
                  {errors.confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error font-medium">
                        {errors.confirmPassword.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control mt-6">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="btn btn-primary w-full"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
