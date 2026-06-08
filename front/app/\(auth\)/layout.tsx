import { Rubik, Alata } from "next/font/google";
import "../globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-rubik",
});

const alata = Alata({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alata",
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${rubik.variable} ${alata.variable}`}>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
