'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOut } from "@/components/signout-button"
import { BGGUser } from '../user-avatar'
import { Home, SquareLibrary, Dices } from 'lucide-react'
import { UserProps } from '@/types/gameTypes'

export default function NavBarClient({ user }: UserProps) {
  const pathname = usePathname()

  return (
    <nav className="bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 p-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <Link href="/dashboard" className="text-amber-900 font-bold text-2xl mb-4 sm:mb-0 hover:text-amber-700 transition-colors flex items-center">
            <Dices className="w-6 h-6 text-amber-600 mr-2" /> GameXchange 
          </Link>
          <ul className="flex items-center space-x-2 sm:space-x-4">
            <NavItem href="/dashboard" active={pathname === '/dashboard'}>
              <Home className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </NavItem>
            <NavItem href="/my-collection" active={pathname === '/my-collection'}>
              <SquareLibrary className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">My Collection</span>
            </NavItem>
            {user && (
              <li className="ml-4">
                <BGGUser user={user} />
              </li>
            )}
            <li className="ml-2">
              <SignOut />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

interface NavItemProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavItem({ href, active, children }: NavItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all
          ${active 
            ? 'bg-amber-600 text-white' 
            : 'text-amber-900 hover:bg-amber-200 hover:text-amber-950'
          }`}
      >
        {children}
      </Link>
    </li>
  )
}