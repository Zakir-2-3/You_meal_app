import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { createClient } from "@supabase/supabase-js";

import { cleanupOldUsers } from "@/lib/cleanupOldUsers";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Удаляем старых пользователей и аватарки
      await cleanupOldUsers();

      // При первом входе через Google
      if (account && user?.email) {
        // Проверяем, есть ли пользователь в Supabase
        const { data: existingUser, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        if (!existingUser) {
          // Создаём пользователя вручную
          const { data: newUser, error: insertError } = await supabase
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
            console.error("Ошибка при создании пользователя:", insertError);
          } else {
            token.id = newUser.id;
          }
        } else {
          console.log("Пользователь уже есть:", existingUser);
          token.id = existingUser.id;
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
