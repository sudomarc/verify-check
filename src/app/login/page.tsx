import { Suspense } from "react";
import LoginForm from "./LoginForm";

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f6f7f9",
    fontFamily: "system-ui, sans-serif",
  },
};

export default function LoginPage() {
  return (
    <main style={styles.main}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
