import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface BackButtonProps {
  href: string;
}

export function BackButton({ href }: BackButtonProps) {
  return (
    <Button variant="outline">
      <Link href={href} className="flex items-center gap-1 text-sm mr-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Link>
    </Button>
  );
}