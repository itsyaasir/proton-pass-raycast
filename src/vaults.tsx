import { AuthProvider, Vaults } from "./components";

export default function Command() {
  return (
    <AuthProvider>
      <Vaults />
    </AuthProvider>
  );
}
