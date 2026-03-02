diff --git a/src/lib/supabase/middleware.ts b/src/lib/supabase/middleware.ts
index e923462974c03f9acade2c6afaa73be12c26aa89..31f3fc54050de062a18de47cb5bc26eaad65011f 100644
--- a/src/lib/supabase/middleware.ts
+++ b/src/lib/supabase/middleware.ts
@@ -18,47 +18,49 @@ export async function updateSession(request: NextRequest) {
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
