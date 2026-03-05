import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const loggedIn = true; // depois você pode colocar lógica real

  if (!loggedIn) {
    return <div>Você precisa logar</div>;
  }

  return <>{children}</>;
}