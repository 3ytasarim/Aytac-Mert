import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ResetPasswordModal } from "@/components/ResetPasswordModal";

export default function ResetPassword() {
  const [location] = useLocation();
  const [token, setToken] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Extract token from URL parameters
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");
    
    if (resetToken) {
      setToken(resetToken);
      setShowModal(true);
    }
  }, [location]);

  const handleClose = () => {
    setShowModal(false);
    // Redirect to home page
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Şifre Sıfırlama
        </h1>
        <p className="text-gray-600">
          Şifre sıfırlama işlemi başlatılıyor...
        </p>
      </div>
      
      {token && (
        <ResetPasswordModal 
          isOpen={showModal}
          onClose={handleClose}
          token={token}
        />
      )}
    </div>
  );
}