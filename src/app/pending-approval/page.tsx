import { UserButton } from "@clerk/nextjs";

export const metadata = { title: "Pending Approval — AJ Commercial Group" };

export default function PendingApprovalPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f8fa",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "40px",
          maxWidth: "480px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo/aj-logo-black.png"
          alt="AJ Commercial Group"
          style={{ height: "80px", width: "auto", marginBottom: "24px" }}
        />
        <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a", marginBottom: "12px" }}>
          Pending Approval
        </h1>
        <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "24px" }}>
          Your account has been created and is awaiting approval from an administrator. You&apos;ll
          be notified as soon as you&apos;re granted access. If this is urgent, reach out to your
          AJ Commercial Group contact.
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </div>
  );
}
