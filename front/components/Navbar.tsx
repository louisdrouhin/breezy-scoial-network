"use client";

import Link from "next/link";
import Image from "next/image";
import { House, CircleUser, Bell } from "lucide-react";

export default function Navbar() {
  return (
    <div
      className="fixed left-4 top-4 bottom-4 w-72 h-auto bg-[#1A4731] p-6 flex flex-col gap-8 rounded-lg"
      style={{ alignItems: "flex-start" }}
    >
      <div style={{ paddingLeft: "12px" }}>
        <Image src="/Breezy-Logo.svg" alt="Logo" width={300} height={300} />
      </div>

      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "white",
          textDecoration: "none",
          paddingLeft: "24px",
        }}
        className="font-rubik"
      >
        <House size={24} />
        <span>Home</span>
      </Link>
      <Link
        href="/profile"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "white",
          textDecoration: "none",
          paddingLeft: "24px",
        }}
        className="font-rubik"
      >
        <CircleUser size={24} />
        <span>Profile</span>
      </Link>
      <Link
        href="/notifications"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "white",
          textDecoration: "none",
          paddingLeft: "24px",
        }}
        className="font-rubik"
      >
        <Bell size={24} />
        <span>Notifications</span>
      </Link>
    </div>
  );
}
