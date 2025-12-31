"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Package,
  LayoutDashboard,
  Users,
  ShoppingCart,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["admin", "staff"] },
  { icon: Users, label: "Clients", href: "/clients", roles: ["admin", "staff"] },
  { icon: ShoppingCart, label: "Orders", href: "/orders", roles: ["admin", "staff"] },
  { icon: FileText, label: "Invoices", href: "/invoices", roles: ["admin", "staff"] },
  { icon: DollarSign, label: "Payments", href: "/payments", roles: ["admin", "staff"] },
  { icon: BarChart3, label: "Reports", href: "/reports", roles: ["admin"] },
  { icon: Settings, label: "Settings", href: "/settings", roles: ["admin"] },
]

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout, isLoading } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role ?? "staff")
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ===== Desktop Sidebar ===== */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Image
              src="/icon-192x192.jpg"
              alt="Shreeram Logo"
              width={40}
              height={40}
              className="rounded"
              priority
            />
            <div>
              <h1 className="text-lg font-bold">Shreeram</h1>
              <p className="text-xs text-muted-foreground">Enterprise</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {typeof user?.name === "string" && user.name.length > 0
                ? user.name[0].toUpperCase()
                : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* ===== Mobile Header ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image
              src="/icon-192x192.jpg"
              alt="Shreeram Logo"
              width={40}
              height={40}
              className="rounded"
              priority
            />
            <div>
              <h1 className="text-lg font-bold">Shreeram</h1>
              <p className="text-xs text-muted-foreground">Enterprise</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg max-h-[calc(100vh-73px)] overflow-y-auto">
            <nav className="p-4 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => {
                  setMobileMenuOpen(false)
                  logout()
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Main Content ===== */}
      <main className="flex-1 overflow-y-auto pt-[73px] md:pt-0">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
