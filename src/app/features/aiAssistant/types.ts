export type Action = { label: string; to: string };

export type Msg = {
  from: "ai" | "you";
  text: string;
  actions?: Action[];
};
