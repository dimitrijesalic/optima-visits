'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FC, useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  changePassword,
  ChangePasswordParams,
} from '@/components/change-password-modal/actions'

interface ChangePasswordModalProps {
  open: boolean
}

const ChangePasswordModal: FC<ChangePasswordModalProps> = ({ open }) => {
  const [isOpen, setIsOpen] = useState(open)

  useEffect(() => {
    if (open) {
      setIsOpen(true)
    }
  }, [open])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: async (props: ChangePasswordParams) => {
      return changePassword(props)
    },
    onSuccess: async () => {
      setIsOpen(false)
      toast.success('Lozinka je uspešno promenjena', {
        position: 'bottom-right',
      })
    },
    onError: () => {
      toast.error('Promena lozinke nije uspela', {
        position: 'bottom-right',
      })
    },
  })

  const handleChange = () => {
    if (newPassword !== confirmPassword) {
      setError('Lozinke se ne poklapaju')
      return
    }

    if (newPassword.length < 8) {
      setError('Lozinka mora imati najmanje 8 karaktera')
      return
    }

    if (newPassword === currentPassword) {
      setError('Nova lozinka ne može biti ista kao trenutna')
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Lozinka mora sadržati bar jedno veliko slovo')
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Lozinka mora sadržati bar jedan broj')
      return
    }

    setError('')

    mutate({
      currentPassword,
      newPassword,
      repeatedNewPassword: confirmPassword,
    })
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promenite lozinku</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Trenutna lozinka</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nova lozinka</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full"
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Potvrdite novu lozinku</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full"
            minLength={8}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <AlertDialogFooter>
          <Button
            onClick={() => handleChange()}
            disabled={isPending}
          >
            {isPending ? 'Menjanje...' : 'Promenite lozinku'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ChangePasswordModal
