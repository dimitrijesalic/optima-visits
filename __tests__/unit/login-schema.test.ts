import { loginSchema } from '@/src/schemas/login-schema'

describe('loginSchema', () => {
  it('validates a correct email and password', () => {
    const result = loginSchema.safeParse({
      email: 'user@optima.rs',
      password: 'MojaLozinka123!',
    })

    expect(result.success).toBe(true)
  })

  it('fails when email is empty', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'MojaLozinka123!',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email je obavezan')
    }
  })

  it('fails when email is invalid format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'MojaLozinka123!',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email mora biti validan')
    }
  })

  it('fails when email is missing', () => {
    const result = loginSchema.safeParse({
      password: 'MojaLozinka123!',
    })

    expect(result.success).toBe(false)
  })

  it('fails when password is empty', () => {
    const result = loginSchema.safeParse({
      email: 'user@optima.rs',
      password: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Lozinka je obavezna')
    }
  })

  it('fails when password is missing', () => {
    const result = loginSchema.safeParse({
      email: 'user@optima.rs',
    })

    expect(result.success).toBe(false)
  })

  it('fails when both fields are empty', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
    }
  })
})
