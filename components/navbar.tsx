"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, Menu, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Wallet from "./Wallet"

const navLinks = [
  {
    href: "https://github.com/oceanprotocol/pdr-backend/blob/main/READMEs/get-tokens.md",
    label: "Get tokens",
    external: true,
  },
  {
    href: "https://github.com/oceanprotocol/pdr-backend/blob/main/README.md",
    label: "Run bots",
    external: true,
  },
  {
    href: "https://docs.predictoor.ai",
    label: "Docs",
    external: true,
  },
]

export function Navbar() {
  const { setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging'
  const networkUrl = isStaging ? 'https://predictoor.ai' : 'https://test.predictoor.ai'
  const networkLabel = `Go to ${isStaging ? 'Mainnet' : 'Testnet'}`

  return (
    <nav className="relative z-50">
      <div className="flex h-16 items-center px-4 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center mr-6">
          <Image
            src="/logo.png"
            height={32}
            width={123}
            alt="Ocean Predictoor logo"
            priority
            className="md:h-10 md:w-[154px]"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6 flex-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
          <a
            href={networkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {networkLabel}
          </a>
        </div>

        {/* Desktop Theme Switcher & Connect Wallet */}
        <div className="hidden md:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Wallet />
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden ml-auto items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium transition-colors hover:text-primary py-2 px-4 rounded-md hover:bg-accent"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={networkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium transition-colors hover:text-primary py-2 px-4 rounded-md hover:bg-accent"
                >
                  {networkLabel}
                </a>
                <div className="pt-4 border-t">
                  <Wallet />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
