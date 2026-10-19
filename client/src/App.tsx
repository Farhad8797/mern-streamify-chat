import { Route, Routes } from "react-router";
import ChatPage from "./pages/chatPage";
import SignInPage from "./pages/signInPage";
import SignUpPage from "./pages/signUpPage";
import { BackgroundLayout } from "./components/bg";

export default function App() {
  return (
    <BackgroundLayout>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Routes>
    </BackgroundLayout>
  );
}
