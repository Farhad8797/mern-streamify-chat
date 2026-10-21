import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthstore";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword, isSendingForgotPassword, forgotPasswordResponse } =
    useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const res = await forgotPassword(data.email);

    if (res?.status === 400) {
      toast.error(res.data?.message || "Invalid request.");
    } else if (res?.status === 500) {
      toast.error(
        "An unexpected problem occured in the server. Please try again later.",
      );
    }
  };

  const isSuccess =
    forgotPasswordResponse?.statusCode === 200 &&
    forgotPasswordResponse?.success;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-xl font-bold justify-center text-base-content text-center mb-2">
            Enter your email address for password recovery.
          </h2>
          <p className="text-center text-sm text-base-content/70 mb-6">
            We will send you instructions to reset your password.
          </p>

          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-success font-medium text-base">
                {forgotPasswordResponse.message}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-control w-full">
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
                    disabled={isSendingForgotPassword}
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

              <div className="form-control mt-6">
                <button
                  type="submit"
                  disabled={isSendingForgotPassword}
                  className="btn btn-primary w-full"
                >
                  {isSendingForgotPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send email"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
