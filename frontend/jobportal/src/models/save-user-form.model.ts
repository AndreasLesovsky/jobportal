export interface SaveUserForm {
  id?: number | null;
  username: string;
  email: string;
  role_id: number | null;
  password?: string;
}
