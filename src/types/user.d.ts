export const UserRoleNames = {
  ADMIN: 'Administrador',
  GESTOR_PUBLICO: 'Gestor_Publico',
  PESQUISADOR: 'Pesquisador',
  ONG: 'ONG',
  SOCIEDADE_CIVIL: 'Sociedade_Civil',
  TURISTA: 'Turista',
} as const;

export type UserRoleNames = (typeof UserRoleNames)[keyof typeof UserRoleNames];

export interface User {
  id: number;
  name: string;
  email: string;
  institution?: string;
  user_profile?: {
    profile: {
      id: number;
      name: string;
    };
  };
}

export interface Profile {
  id: number;
  name: string;
}

