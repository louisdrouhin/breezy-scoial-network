import { Rubik, Alata } from "next/font/google";
import "./globals.css";

import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotifProvider } from "@/contexts/NotifContext";

const rubik = Rubik({
  subsets: ["latin"],
  weight: "600", // semi-bold
  variable: "--font-rubik",
});

const alata = Alata({
  subsets: ["latin"],
  weight: "400", // regular
  variable: "--font-alata",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${rubik.variable} ${alata.variable}`}>
      <body>
        <AuthProvider>
          <NotifProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </NotifProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
