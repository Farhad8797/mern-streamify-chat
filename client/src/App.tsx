import { Navigate, Route, Routes } from "react-router-dom";
import ChatPage from "./pages/chatPage";
import SignInPage from "./pages/signInPage";
import SignUpPage from "./pages/signUpPage";
import { BackgroundLayout } from "./components/bg";
import useAuthStore from "./store/useAuthstore";
import { useEffect } from "react";
import NotFoundPage from "./pages/404PageNotFound";
import VerifySignUpEmailPage from "./pages/signUpVerification";

export default function App() {
  const { authUser, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
          element={<VerifySignUpEmailPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BackgroundLayout>
  );
}
