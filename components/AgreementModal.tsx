"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AgreementModal() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Calculate whether modal should be open using useMemo
  const shouldModalBeOpen = useMemo(() => {
    if (typeof window === "undefined") return false;
    const hasAgreed = window.localStorage.getItem("termsOfUse") === "agreed";
    return !hasAgreed && pathname !== "/terms";
  }, [pathname]);

  // Use local state for controlled modal open/close
  const [isOpen, setIsOpen] = useState(shouldModalBeOpen);

  // Sync isOpen with shouldModalBeOpen when pathname changes
  useEffect(() => {
    setIsOpen(shouldModalBeOpen);
  }, [shouldModalBeOpen]);

  const onContinue = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("termsOfUse", "agreed");
    }
    if (pathname === "/terms") router.push("/");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full max-w-md rounded-2xl border border-border/60 bg-gradient-to-b from-background to-background/95 p-6 shadow-xl">
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Welcome to Predictoor
            </h2>
            <p className="text-sm text-muted-foreground">
              Before using the app, please confirm that you&apos;ve read and
              agree to our terms of use.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
            <Checkbox
              id="terms-checkbox"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(!!checked)}
              className="mt-0.5"
            />
            <label
              htmlFor="terms-checkbox"
              className="text-sm text-foreground leading-snug cursor-pointer"
            >
              I have read and I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Terms of use
              </Link>{" "}
              of this website.
            </label>
          </div>

          <Button
            className="w-full"
            size="sm"
            disabled={!agreed}
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
