import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "CANDIDATE" | "EMPLOYER";
    };
  }

  interface User {
    role: "CANDIDATE" | "EMPLOYER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "CANDIDATE" | "EMPLOYER";
    id?: string;
  }
}
