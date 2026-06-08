import PostBar from "@/components/PostBar";
import SearchBar from "@/components/SearchBar";
import Subscriptions from "@/components/Subscriptions";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#F4F5F4",
        paddingTop: "20px",
        paddingRight: "20px",
        paddingBottom: "20px",
        marginLeft: "320px",
      }}
    >
      {/* Center Column */}
      <div
        style={{ flex: "0 0 80%", paddingRight: "20px", paddingLeft: "20px" }}
      >
        <PostBar />
      </div>

      {/* Right Sidebar */}
      <div style={{ flex: "0 0 20%" }}>
        <SearchBar />
        <Subscriptions />
      </div>
    </div>
  );
}
