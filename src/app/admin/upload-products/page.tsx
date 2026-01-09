"use client";

import Protected from "@/src/components/Protected";
import { UploadProdutos } from "@/src/components/UploadProducts";

export default function UploadProductsPage() {
  return (
    <Protected roles={["DEV", "ADMIN", "OPERACIONAL"]}>
      <UploadProdutos />
    </Protected>
  );
}
