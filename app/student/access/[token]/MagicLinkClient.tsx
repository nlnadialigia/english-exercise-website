"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { processMagicLink } from "@/lib/actions/magic-link";

interface Props {
  token: string;
}

export default function MagicLinkClient({ token }: Props) {
  const router = useRouter();

  useEffect(() => {
    async function handleMagicLink() {
      const result = await processMagicLink(token);
      
      if (result.success) {
        router.push("/dashboard/student");
      } else {
        router.push(`/login?error=${result.error}`);
      }
    }

    handleMagicLink();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processando acesso...</p>
      </div>
    </div>
  );
}
