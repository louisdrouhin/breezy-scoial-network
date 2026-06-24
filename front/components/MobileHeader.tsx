"use client";

import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./MobileMenu";

export default function MobileHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        backgroundColor: "#F4F5F4",
        borderBottom: "1px solid #E0E0E0",
      }}
    >
      {/* Menu with Avatar */}
      <MobileMenu />

      {/* Logo center */}
      <Link href="/">
        <Image src="/Breezy-Logo.svg" alt="Logo" width={110} height={110} style={{ height: "auto" }} />
      </Link>

      {/* Empty right for balance */}
      <div style={{ width: "40px" }} />
    </div>
  );
}
