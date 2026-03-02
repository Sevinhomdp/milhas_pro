<<<<<<< codex/fix-critical-server-component-bugs-b3y78y
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  return { supabaseUrl, supabaseKey }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { supabaseUrl, supabaseKey } = getSupabaseEnv()

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Garante refresh dos cookies de auth em toda request SSR.
  await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
=======
diff --git a/src/lib/supabase/middleware.ts b/src/lib/supabase/middleware.ts
index e923462974c03f9acade2c6afaa73be12c26aa89..1e0d2aea0740f97d23fbe9aa8dd1fae9441ed238 100644
--- a/src/lib/supabase/middleware.ts
+++ b/src/lib/supabase/middleware.ts
@@ -18,47 +18,50 @@ export async function updateSession(request: NextRequest) {
   if (!supabaseUrl || !supabaseKey) {
     return supabaseResponse
   }
 
   const supabase = createServerClient(
     supabaseUrl,
     supabaseKey,
     {
       cookies: {
         getAll() {
           return request.cookies.getAll()
         },
         setAll(cookiesToSet) {
           cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
           supabaseResponse = NextResponse.next({
             request,
           })
           cookiesToSet.forEach(({ name, value, options }) =>
             supabaseResponse.cookies.set(name, value, options)
           )
         },
       },
     }
   )
 
+  // Garante refresh dos cookies de auth em toda request SSR.
+  await supabase.auth.getSession()
+
   const {
     data: { user },
   } = await supabase.auth.getUser()
 
   if (
     !user &&
     !request.nextUrl.pathname.startsWith('/login') &&
     !request.nextUrl.pathname.startsWith('/auth')
   ) {
     const url = request.nextUrl.clone()
     url.pathname = '/login'
     return NextResponse.redirect(url)
   }
 
   if (user && request.nextUrl.pathname === '/login') {
     const url = request.nextUrl.clone()
     url.pathname = '/'
     return NextResponse.redirect(url)
   }
 
   return supabaseResponse
 }
>>>>>>> main
