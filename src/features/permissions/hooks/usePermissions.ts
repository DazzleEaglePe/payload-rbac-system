import { useEffect, useState } from 'react'
import type { UserPermissions, Module, Operation } from '@/features/shared/types'

export const usePermissions = (userId: string | undefined | null, userRole?: string) => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userRole === 'admin') {
      setPermissions(null)
      setLoading(false)
      return
    }

    if (!userId) {
      setPermissions(null)
      setLoading(false)
      return
    }

    const fetchPermissions = async () => {
      try {
        const res = await fetch(`/api/permissions?where[user][equals]=${userId}&depth=0`)
        const data = await res.json()
        if (data?.docs?.length > 0) {
          setPermissions(data.docs[0])
        } else {
          setPermissions(null)
        }
      } catch (err) {
        console.error('Failed to fetch permissions', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [userId, userRole])

  const hasPermission = (module: Module, operation: Operation): boolean => {
    if (userRole === 'admin') return true
    if (!permissions) return false
    return permissions[module]?.[operation] === true
  }

  return { permissions, loading, hasPermission }
}