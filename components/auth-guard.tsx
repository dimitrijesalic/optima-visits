'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '@/components/change-password-modal/actions'
import ChangePasswordModal from '@/components/change-password-modal/change-password-modal'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
  })

  useEffect(() => {
    if (currentUser?.isPasswordChanged === false) {
      setIsOpen(true)
    }
  }, [currentUser])

  return (
    <>
      <ChangePasswordModal open={isOpen} />
      {children}
    </>
  )
}
