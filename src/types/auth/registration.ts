import { RegForm } from "./user-data";

export type AuthStep = "form" | "verify" | "set-new-password";
export type ForgotOrigin = "sign-in" | "sign-up";

export interface UseRegistrationLogicProps {
  loadUserData: (email: string) => Promise<void>;
  ui: {
    isSignUpMode: boolean;
    setStep: (step: AuthStep) => void;
    setLocalEmail: (email: string) => void;
    setLocalName: (name: string) => void;
    setLocalPassword: (password: string) => void;
    setSignInError: (error: string) => void;
    setPasswordError: (error: string) => void;
    geoCity?: string;
    localEmail: string;
    localName: string;
    localPassword: string;
  };
}

export interface UseRegistrationLogicReturn {
  methods: any;
  verifyMethods: any;
  handleSubmitForm: (data: RegForm) => Promise<void>;
  handleVerifySubmit: (data: { code: string }) => Promise<void>;
  canResend: boolean;
  startTimer: (seconds: number) => void;
  formatTime: () => string;
  attempts: number;
  setAttempts: (attempts: number) => void;
  doCleanup: () => void;
  t: any;
}
