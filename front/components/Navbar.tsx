"use client";

import Link from "next/link";
import Image from "next/image";
import { House, CircleUser, Bell, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifCount } from "@/contexts/NotifContext";
import { userAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { logout, user } = useAuth();
  const { unreadCount } = useNotifCount();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.username) return;
    userAPI.getProfile(user.username).then(p => setAvatarUrl(p.avatarUrl ?? null)).catch(() => {});
  }, [user?.username]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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
        href={user ? `/profile/${user.username}` : "/profile"}
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
          position: "relative",
        }}
        className="font-rubik"
      >
        <div style={{ position: "relative", display: "flex" }}>
          <Bell size={24} />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              backgroundColor: "#dc2626",
              color: "white",
              borderRadius: "999px",
              fontSize: "10px",
              fontFamily: "var(--font-alata)",
              fontWeight: "bold",
              minWidth: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              lineHeight: 1,
            }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
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
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.username}
            style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              flexShrink: 0,
            }}
          />
        )}
        <span style={{ color: "white", fontFamily: "var(--font-alata)" }}>
          {user?.username || "User"}
        </span>
        <button
          onClick={handleLogout}
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
