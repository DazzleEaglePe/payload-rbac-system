'use client'
import React from 'react'
import { ProtectedRoute } from '../../../features/auth/components/ProtectedRoute'
import { Sidebar, MobileSidebar } from '../../../features/shared/components/Sidebar'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden">
        <MobileSidebar />
        <Sidebar />
        <main className="flex-1 overflow-y-auto scrollbar-fade">
          <div className="p-4 md:p-8 lg:p-10 max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
