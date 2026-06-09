"use client";

import Link from "next/link";
import Image from "next/image";
import { House, CircleUser, Bell, Settings, LogOut } from "lucide-react";

export default function Navbar() {
  return (
    <div
      className="fixed left-4 top-4 bottom-4 w-72 h-auto bg-[#1A4731] p-6 flex flex-col gap-8 rounded-lg"
      style={{ alignItems: "flex-start" }}
    >
      <Link href="/" style={{ paddingLeft: "12px" }}>
        <Image src="/Breezy-Logo.svg" alt="Logo" width={300} height={300} />
      </Link>

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
      <Link
        href="/settings"
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
        <Settings size={24} />
        <span>Settings</span>
      </Link>

      <div
        style={{
          marginTop: "auto",
          paddingTop: "16px",
          paddingBottom: "12px",
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          paddingLeft: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            flexShrink: 0,
          }}
        />
        <span style={{ color: "white", fontFamily: "var(--font-alata)" }}>
          User Name
        </span>
        <button
          style={{
            padding: "6px",
            backgroundColor: "transparent",
            color: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "auto",
          }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}
