import { AuthProvider, Items } from "./components";

export default function Command() {
  return (
    <AuthProvider>
      <Items />
    </AuthProvider>
  );
}
