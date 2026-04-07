import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { cleanupOldUsers } from "@/lib/user/cleanupOldUsers";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdminClient";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Удаляем старых пользователей и аватарки
      await cleanupOldUsers();

      // При первом входе через Google
      if (account && user?.email) {
        // Проверяем, есть ли пользователь в Supabase
        const { data: existingUser, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        if (!existingUser) {
          // Создаём пользователя вручную
          const { data: newUser, error: insertError } = await supabaseAdmin
            .from("users")
            .insert([
              {
                email: user.email,
                name: user.name,
                avatar: user.image,
                createdAt: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.error("Error creating user:", insertError);
          } else {
            token.id = newUser.id;
            if (process.env.NODE_ENV === "development") {
              console.log("New user created:", user.email);
            }
          }
        } else {
          token.id = existingUser.id;
          if (process.env.NODE_ENV === "development") {
            console.log("Existing user signed in:", user.email);
          }
        }

        token.email = user.email;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.picture;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
