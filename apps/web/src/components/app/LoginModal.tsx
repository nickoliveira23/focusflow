import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
}

export function LoginModal({ isOpen, onClose, onGoogleLogin }: LoginModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="modal-card login-modal-card">
        <DialogHeader className="modal-header">
          <div>
            <DialogTitle>Sign in</DialogTitle>
            <DialogDescription>Use your account to sync settings and progress.</DialogDescription>
          </div>
        </DialogHeader>
        <div className="login-options">
          <button type="button" className="provider-button provider-google" onClick={onGoogleLogin}>
            <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M9 7.2v3.7h5.1c-.2 1.2-1.4 3.7-5.1 3.7-3.1 0-5.6-2.6-5.6-5.6S5.9 3.4 9 3.4c1.8 0 3 .8 3.7 1.5l2.5-2.4C13.7 1.1 11.6 0 9 0 4 0 0 4 0 9s4 9 9 9c5.2 0 8.6-3.7 8.6-8.8 0-.6-.1-1-.2-1.4H9z"
              />
              <path
                fill="#FBBC05"
                d="M1 5.3l3 2.2C4.7 5.8 6.7 4.4 9 4.4c1.8 0 3 .8 3.7 1.5l2.5-2.4C13.7 1.1 11.6 0 9 0 5.5 0 2.4 2 1 5.3z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.5 0 4.6-.8 6.1-2.2l-2.8-2.3c-.8.6-1.9 1.1-3.3 1.1-2.4 0-4.5-1.6-5.2-3.9l-3 2.3C2.2 16 5.3 18 9 18z"
              />
              <path
                fill="#4285F4"
                d="M17.6 9.2c0-.6-.1-1-.2-1.5H9v3.2h4.8c-.2 1-.8 1.8-1.6 2.4l2.8 2.3c1.6-1.5 2.6-3.7 2.6-6.4z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
          <p className="login-soon">More providers coming soon.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
