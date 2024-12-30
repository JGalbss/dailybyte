export type Submission = {
  id: string;
  user_id: string;
  problem_id: string;
  code: string;
  language: string;
  memory_used: number | null;
  time_used_ms: number | null;
  status: 'pending' | 'passed' | 'failed';
  created_at: string;
  submitted_at: string;
};
