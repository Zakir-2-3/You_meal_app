import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider?: string;
      avatar?: string | null;
    } & DefaultSession["user"];
  }

  interface Profile {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string;
    username?: string;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
  }
}
