import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/auth/callback"];

export async function middleware(request: NextRequest) {
  try {
    // Check if required environment variables exist
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.next();
    }

    let response = NextResponse.next({ 
      request: { 
        headers: request.headers 
      } 
    });

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    let user = null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Supabase auth error:", error.message);
        // Continue without authentication check if Supabase fails
        return NextResponse.next();
      }
      user = data.user;
    } catch (authError) {
      console.error("Auth check failed:", authError);
      // Continue without authentication check if auth fails
      return NextResponse.next();
    }

    const isPublic = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));

    // Redirect unauthenticated users to login (except for public paths)
    if (!user && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
      const url = request.nextUrl.clone();
      url.pathname = "/feed";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // If middleware fails completely, just let the request through
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
