export interface Props {
  email: string;
  name: string;
  password: string;
  attempts: number;
  canResend: boolean;
  startTimer: (duration: number) => void;
  formatTime: () => string;
  onBack: () => void;
  onSubmit: () => void;
}
