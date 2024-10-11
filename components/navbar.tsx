'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="text-white font-bold text-xl mb-4 sm:mb-0">
          GameXchange
        </div>
        <ul className="flex space-x-4">
          <li>
            <Link 
              href="/dashboard" 
              className={`text-white hover:text-gray-300 transition-colors ${
                pathname === '/dashboard' ? 'border-b-2 border-white' : ''
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              href="/my-collection" 
              className={`text-white hover:text-gray-300 transition-colors ${
                pathname === '/my-collection' ? 'border-b-2 border-white' : ''
              }`}
            >
              My Collection
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}