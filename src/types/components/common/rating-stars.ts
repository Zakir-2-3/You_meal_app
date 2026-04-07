export interface Props {
  value: number;
  onChange?: (v: number) => void;
  as?: "div" | "span";
}
