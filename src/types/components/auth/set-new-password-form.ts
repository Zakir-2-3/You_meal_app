export interface Props {
  email: string;
  onSubmit: (data: { password: string }) => Promise<void>;
}
