import { useState } from "react";
import { useNavigate } from "react-router-dom";
import IllustratedStudyRoom from "../components/study/IllustratedStudyRoom";
import AuthModal from "../components/auth/AuthModal";

export default function Signup() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative min-h-screen">
      <IllustratedStudyRoom />
      <AuthModal
        isOpen={isOpen}
        initialMode="signup"
        onClose={() => {
          setIsOpen(false);
          navigate("/", { replace: true });
        }}
        onSuccess={() => {
          navigate("/dashboard", { replace: true });
        }}
      />
    </div>
  );
}