// Temporary route — hit GET /api/debug/throw to confirm Sentry captures exceptions.
// Delete this file once you have verified the error appears in your Sentry project.
export const dynamic = 'force-dynamic'

export async function GET() {
  throw new Error('Debug: intentional Sentry test error — safe to delete this route')
}
