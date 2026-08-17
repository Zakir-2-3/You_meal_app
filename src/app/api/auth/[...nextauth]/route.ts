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
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        await cleanupOldUsers();

        // Удаляем временные данные из VerificationCode, если им >2 часов
        await supabaseAdmin
          .from("VerificationCode")
          .delete()
          .lt(
            "createdAt",
            new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          );

        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("id, password")
          .eq("email", user.email)
          .single();

        if (existingUser?.password) {
          // Перенаправляем на главную с параметром ошибки
          return "/?error=EmailAlreadyRegistered";
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // Удаляем старых пользователей и аватарки
      await cleanupOldUsers();

      // При первом входе через Google
      if (account && user?.email) {
        // Проверяем, есть ли пользователь в Supabase
        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        if (existingUser) {
          // Если Google-аккаунт обновляем токен из БД
          token.id = existingUser.id;
          token.email = existingUser.email;
          token.name = existingUser.name;
          token.picture = existingUser.avatar;
          return token;
        }

        // Если пользователя нет — создаём нового Google-пользователя
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
          token.error = "SignInError";
          return token;
        }

        token.id = newUser.id;
        token.email = newUser.email;
        token.name = newUser.name;
        token.picture = newUser.avatar;
        return token;
      }

      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (token.error) {
        session.error = token.error;
        return session;
      }

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
