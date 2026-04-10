import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  // Handle error from Supabase auth (e.g., expired link)
  if (error) {
    const errorMessage = errorDescription || error
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(errorMessage)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(exchangeError.message)}`)
  }

  return NextResponse.redirect(`${origin}/auth/error?error=No code provided`)
}
