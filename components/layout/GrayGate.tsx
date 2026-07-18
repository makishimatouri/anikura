import Link from "next/link";

// 灰度门禁墙：仅在部署设置 NEXT_PUBLIC_GRAY_HOST 且访问者非管理员时渲染。
// 生产构建不包含该环境变量，此组件不会被打包进正式站逻辑。
export default function GrayGate({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#08080c",
        color: "#e8e8ee",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.3em",
            color: "#8a8a99",
            marginBottom: 16,
          }}
        >
          GRAY RELEASE
        </div>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>灰度测试环境</h1>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "#b9b9c6" }}>
          这里跑的是尚未发布的新版 Anikura CN，仅管理员可见。
          <br />
          正式站请访问{" "}
          <a
            href="https://www.anikura.cn"
            style={{ color: "#e8b4c8", textDecoration: "underline" }}
          >
            www.anikura.cn
          </a>
        </p>
        {loggedIn ? (
          <p style={{ fontSize: 14, marginTop: 20, color: "#d99a9a" }}>
            当前账号没有管理员权限，请退出后换管理员账号登录。
          </p>
        ) : (
          <div style={{ marginTop: 24 }}>
            <Link
              href="/auth/login"
              style={{
                display: "inline-block",
                padding: "10px 28px",
                border: "1px solid #e8b4c8",
                color: "#e8b4c8",
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              登录管理员账号
            </Link>
            <p style={{ fontSize: 12, marginTop: 16, color: "#8a8a99" }}>
              灰度站与正式站登录状态不互通，需要重新登录一次。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
