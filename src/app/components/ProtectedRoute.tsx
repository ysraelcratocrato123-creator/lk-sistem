import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const isLoggedIn = !!localStorage.getItem("user"); // Exemplo simples
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}