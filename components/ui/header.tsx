"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  MessageCircle,
  LogOut,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useSession } from "@/lib/contexts/session-context";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { isAuthenticated, logout, user } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/features", label: "Features" },
    { href: "/about", label: "About Echo" },
  ];

  return (
    <motion.div
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-lg shadow-lg"
          : "bg-background/70 backdrop-blur-md"
      }`}
    >
      <header className="relative max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/"
              className="flex items-center space-x-2 transition-transform hover:scale-[1.03]"
            >
              <motion.div
                animate={{ y: [0, -2, 0], rotate: [0, 5, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sprout className="h-7 w-7 text-primary drop-shadow-sm" />
              </motion.div>
              <div className="flex flex-col leading-tight">
                <motion.span
                  className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  Echo
                </motion.span>
                <span className="text-xs text-muted-foreground">
                  Your personal mental health companion
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <motion.div
                  key={item.href}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Link
                    href={item.href}
                    className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground group transition-colors"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 group-hover:shadow-[0_0_8px_var(--primary)] transition-transform duration-300 origin-left rounded-full" />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      asChild
                      className="hidden md:flex gap-2 bg-primary/90 hover:bg-primary shadow-md hover:shadow-primary/30 transition-all"
                    >
                      <Link href="/dashboard">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Start Chat
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ rotate: -5 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={logout}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  </motion.div>
                </>
              ) : (
                <SignInButton />
              )}

              {/* Mobile Menu Toggle */}
              <motion.div whileTap={{ scale: 0.9 }} className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="relative"
                >
                  <AnimatePresence initial={false} mode="wait">
                    {isMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="mobileMenu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="md:hidden border-t border-primary/10 overflow-hidden backdrop-blur-sm bg-background/95"
            >
              <nav className="flex flex-col space-y-1 py-4">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Link
                      href={item.href}
                      className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      asChild
                      className="mt-2 mx-4 gap-2 bg-primary/90 hover:bg-primary shadow-md hover:shadow-primary/30 transition-all"
                    >
                      <Link href="/dashboard">
                        <MessageCircle className="w-4 h-4" />
                        <span>Start Chat</span>
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </motion.div>
  );
}
