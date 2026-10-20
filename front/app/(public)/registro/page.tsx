import { redirect } from "next/navigation";
import { CLIENTE } from "@/lib/config";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegistroPage() {
  if (!CLIENTE.features.registroLibre) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-brand-light">
      <RegisterForm />
    </div>
  );
}
