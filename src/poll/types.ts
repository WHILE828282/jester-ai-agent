export type PollOption = {
  id: number;           // 1..5
  title: string;        // короткий заголовок
  action: "add_rule" | "remove_rule" | "replace_rule";
  key: string;          // rule key (например "no_apologies")
  text?: string;        // текст правила (для add/replace)
};

export type PollState = {
  pollTweetId?: string;
  pollCreatedAt?: number;     // unix ms
  pollOptions?: PollOption[];
  lastResult?: {
    winnerId: number;
    counts: Record<number, number>;
    totalVoters: number;
    appliedAt: number;
    appliedPatch?: {
      action: string;
      key: string;
      before?: any;
      after?: any;
    };
  };
};
