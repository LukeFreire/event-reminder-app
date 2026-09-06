export type UserRole = "admin" | "participant";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  isDisabled: boolean;
}
