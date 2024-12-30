export type Problem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  launch_date: string; // or Date, if you want to parse it as a JS Date
  created_at: string; // or Date
};
