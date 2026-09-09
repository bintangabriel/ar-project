export type User = {
  user: {
    id: number;
    name: string;
    email: string;
    whatsapp_number?: string;
    company?: string;
    profilePictureUrl?: string;
  };
  jwt: { token: string };
  is_new_user: boolean;
};