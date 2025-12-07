"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClientPreviewSwitcher() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/client/${trimmed}`);
  };

  return (
    <form className="space-y-1" onSubmit={handleSubmit}>
      <Label
        htmlFor="client-preview-code"
        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        Quick Client Preview
      </Label>
      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          id="client-preview-code"
          placeholder="e.g. yakuza-dentoto"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="md:max-w-xs"
        />
        <Button type="submit" variant="outline" className="md:w-auto">
          Open Client Dashboard
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter any org code from the client list to jump into their public view.
      </p>
    </form>
  );
}
