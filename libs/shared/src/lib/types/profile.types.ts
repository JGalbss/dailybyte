export type Profile = {
  id: string; // must match auth.users.id
  username: string;
  avatar_url: string | null;
  created_at: string;
};
