import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: env("AUTH_MICROSOFT_ENTRA_ID_ID"),
      clientSecret: env("AUTH_MICROSOFT_ENTRA_ID_SECRET"),
      issuer: env("AUTH_MICROSOFT_ENTRA_ID_ISSUER"),
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const p = profile as {
          oid?: string;
          email?: string;
          preferred_username?: string;
          name?: string;
          picture?: string;
        };

        token.entraOid = p.oid ?? token.entraOid ?? token.sub;
        token.email = p.email ?? p.preferred_username ?? token.email;
        token.name = p.name ?? token.name;
        token.picture = p.picture ?? token.picture;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === "string" ? token.sub : "";
        session.user.entraOid =
          typeof token.entraOid === "string" ? token.entraOid : undefined;

        session.user.email =
          typeof token.email === "string" ? token.email : session.user.email;

        session.user.name =
          typeof token.name === "string" ? token.name : session.user.name;

        session.user.image =
          typeof token.picture === "string" ? token.picture : session.user.image;
      }

      return session;
    },
  },
});