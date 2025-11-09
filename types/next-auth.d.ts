import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email: string | null;
    role: Role;
    isAdmin: boolean;
    isUser: boolean;
    isPremiumUser: boolean;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
