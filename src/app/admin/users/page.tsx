"use client";

import Protected from "@/src/components/Protected";
import RegisterForm from "@/src/components/RegisterForm";

export default function Page() {
  return (
    <Protected roles={["DEV", "ADMIN"]}>
      <RegisterForm
        allowedRoles={["OPERACIONAL", "PRODUCAO", "EXPEDICAO"]}
      />
    </Protected>
  );
}
