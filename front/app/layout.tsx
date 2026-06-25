import { Rubik, Alata } from "next/font/google";
import "./globals.css";

import LayoutWrapper from "@/components/LayoutWrapper";
import AccessStoreBridge from "@/components/AccessStoreBridge";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
    <html lang="en" className={`${rubik.variable} ${alata.variable}`}>
      <body>
        <AuthProvider>
          <AccessStoreBridge />
          <LanguageProvider>
            <NotifProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </NotifProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
