export const mockAdminUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN' as const,
  password: '$2a$10$hashedpassword',
  isPasswordChanged: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  emailVerified: null,
}

export const mockRegularUser = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  email: 'user@test.com',
  firstName: 'Regular',
  lastName: 'User',
  role: 'USER' as const,
  password: '$2a$10$hashedpassword',
  isPasswordChanged: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  emailVerified: null,
}

export const mockPendingVisit = {
  id: '660e8400-e29b-41d4-a716-446655440000',
  status: 'PENDING' as const,
  userId: '550e8400-e29b-41d4-a716-446655440001',
  plannedVisitDate: '2024-01-15',
  plannedTopic: 'Sales review',
  realisedTopic: null,
  plannedVisitTime: '10:00',
  businessPartner: 'Acme Corp',
  plannedVisitDuration: '1h',
  note: null,
  grade: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockDoneVisit = {
  ...mockPendingVisit,
  id: '660e8400-e29b-41d4-a716-446655440001',
  status: 'DONE' as const,
}
