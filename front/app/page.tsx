import Link from "next/link";
import PostBar from "@/components/PostBar";
import SearchBar from "@/components/SearchBar";
import Subscriptions from "@/components/Subscriptions";
import Post from "@/components/Post";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#F4F5F4",
        paddingTop: "20px",
        paddingRight: "20px",
        paddingBottom: "80px",
        paddingLeft: "320px",
      }}
      className="home-container"
    >
      {/* Center Column */}
      <div
        style={{ flex: "0 0 80%", paddingRight: "20px", paddingLeft: "20px" }}
        className="home-center"
      >
        <PostBar />
        <Post
          displayName="John Doe"
          username="johndoe"
          content="Just launched my new project! Really excited about it 🚀"
          createdAt={new Date(Date.now() - 2 * 60 * 60 * 1000)}
          initialLikes={42}
          initialComments={8}
        />
        <Post
          displayName="Jane Smith"
          username="janesmith"
          content="Beautiful sunset today! Nature is amazing"
          createdAt={new Date(Date.now() - 5 * 60 * 60 * 1000)}
          initialLikes={128}
          initialComments={24}
        />
        <Post
          displayName="Dev Community"
          username="devcommunity"
          content="What's your favorite programming language?"
          createdAt={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
          initialLikes={315}
          initialComments={67}
        />
      </div>

      {/* Right Sidebar */}
      <div style={{ flex: "0 0 20%" }} className="home-sidebar">
        <SearchBar />
        <Subscriptions />

        {/* Legal Links */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
            marginTop: "16px",
            justifyContent: "center",
          }}
        >
          <Link
            href="/privacy-policy"
            style={{
              fontFamily: "var(--font-alata)",
              color: "#1A4731",
              fontSize: "12px",
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </Link>
          <span style={{ color: "#E0E0E0" }}>•</span>
          <Link
            href="/terms-of-service"
            style={{
              fontFamily: "var(--font-alata)",
              color: "#1A4731",
              fontSize: "12px",
              textDecoration: "none",
            }}
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
