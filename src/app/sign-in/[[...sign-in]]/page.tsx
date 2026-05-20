import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign in — AJ Commercial Group" };

export default function SignInPage() {
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo/aj-logo-black.png"
          alt="AJ Commercial Group"
          style={{ height: "192px", width: "auto" }}
        />
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-md border border-slate-200",
              headerTitle: "text-base font-semibold",
              headerSubtitle: "text-xs text-slate-500",
              footer: "hidden",
            },
          }}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          forceRedirectUrl="/admin"
        />
      </div>
    </div>
  );
}
