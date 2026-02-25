'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Menu, LogOut, CalendarClock, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

const navItems = [
  {
    href: '/dashboard/upcoming',
    label: 'Predstojeće posete',
    icon: CalendarClock,
  },
  { href: '/dashboard/previous', label: 'Prethodne posete', icon: History },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">Optima</h1>
      </div>
      <Separator />

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto">
        <Separator className="mb-4" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Odjavi se
        </Button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 h-14 bg-background border-b flex items-center px-4 z-40">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigacija</SheetTitle>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="ml-3 font-semibold text-primary">Optima</span>
        </div>
        <div className="h-14" />
      </>
    )
  }

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-background border-r z-40">
      <SidebarContent />
    </aside>
  )
}
