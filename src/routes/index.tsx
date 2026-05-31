import { createFileRoute, redirect } from '@tanstack/react-router'

// Entry point: bounce to the network tab. The nick gate on `/_frame`
// redirects to `/onboarding` when no nickname is stored yet.
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/rede' })
  },
})
