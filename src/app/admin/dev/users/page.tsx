"use client";


import Protected from "@/src/components/Protected";
import RegisterForm from "@/src/components/RegisterForm";


export default function DevUsersPage() {
  
  return (
    <Protected roles={["DEV"]}>
      <RegisterForm allowedRoles={["ADMIN"]} />
        
    </Protected>
  );
}
