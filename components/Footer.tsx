"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background/50 backdrop-blur-xl mt-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 flex flex-col items-center gap-6">

        {/* Message + Discord */}
        <div className="flex flex-col items-center text-center gap-4">
          <p className="text-sm text-muted-foreground">
            Want to be up to date or get support? Join our Discord.
          </p>

          <Button
            asChild
            className="px-6 flex items-center gap-2"
          >
            <a
              href="https://discord.gg/kfrZ8wuTKc"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/discord.svg"
                alt="Discord"
                width={18}
                height={18}
              />
              Discord
            </a>
          </Button>
        </div>

        {/* Link */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors underline"
          >
            Terms
          </Link>
        </div>

      </div>
    </footer>
  );
}
