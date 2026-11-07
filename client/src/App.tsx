import { Navigate, Route, Routes } from "react-router-dom";
import ChatPage from "./pages/chatPage";
import SignInPage from "./pages/signInPage";
import SignUpPage from "./pages/signUpPage";
import { BackgroundLayout } from "./components/bg";
import useAuthStore from "./store/useAuthstore";
import { useEffect } from "react";
import NotFoundPage from "./pages/404PageNotFound";
import VerifySignUpEmailPage from "./pages/signUpVerification";
import ForgotPasswordPage from "./pages/forgetPassword";
import ForgotPasswordVerificationPage from "./pages/forgotPasswordVerification";
import UpdatePasswordPage from "./pages/updatePasswordPage";

export default function App() {
  const { authUser, checkAuth, connectSocket, disconnectSocket } =
    useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) connectSocket();
    else disconnectSocket();
  }, [authUser, connectSocket, disconnectSocket]);
  console.log(authUser);

  return (
    <BackgroundLayout>
      <Routes>
        <Route
          path="/"
          element={authUser ? <ChatPage /> : <Navigate to="/sign-in" />}
        />
        <Route
          path="/sign-in"
          element={authUser ? <Navigate to="/" /> : <SignInPage />}
        />
        <Route
          path="/sign-up"
          element={authUser ? <Navigate to="/" /> : <SignUpPage />}
        />
        <Route
          path="/verify-signup-email"
          element={authUser ? <Navigate to="/" /> : <VerifySignUpEmailPage />}
        />

        <Route
          path="/forgot-password"
          element={authUser ? <Navigate to="/" /> : <ForgotPasswordPage />}
        />
        <Route
          path="/verify-password-recovery-email"
          element={
            authUser ? <Navigate to="/" /> : <ForgotPasswordVerificationPage />
          }
        />
        <Route
          path="/update-password"
          element={authUser ? <Navigate to="/" /> : <UpdatePasswordPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BackgroundLayout>
  );
}
