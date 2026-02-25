import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email je obavezan')
    .email('Email mora biti validan'),
  password: z.string().min(1, 'Lozinka je obavezna'),
})

export type LoginFormData = z.infer<typeof loginSchema>
