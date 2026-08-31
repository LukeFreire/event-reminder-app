export interface Team {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  email: string;
}
