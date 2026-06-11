import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function dashboardForRole(role: string | undefined): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "clinic") return "/klinik/dashboard";
  return "/login";
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isRoot = pathname === "/";
  const isKlinikRoute = pathname.startsWith("/klinik");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/register");
  const isDoctorAuthRoute = pathname.startsWith("/auth/");

  if (isDoctorAuthRoute) {
    return supabaseResponse;
  }

  if (isRoot) {
    const url = request.nextUrl.clone();
    if (!user) {
      return supabaseResponse;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();
    const role =
      profile?.is_active === false ? undefined : profile?.role;
    url.pathname = dashboardForRole(role);
    return NextResponse.redirect(url);
  }

  if ((isKlinikRoute || isAdminRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (isKlinikRoute || isAdminRoute || isAuthRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    const isClinic =
      profile?.role === "clinic" && profile?.is_active !== false;
    const isAdmin =
      profile?.role === "admin" && profile?.is_active !== false;

    if (isAdminRoute && !isAdmin) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "bukan_admin");
      return NextResponse.redirect(url);
    }

    if (isKlinikRoute && !isClinic) {
      if (isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        return NextResponse.redirect(url);
      }
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "bukan_klinik");
      return NextResponse.redirect(url);
    }

    if (isAuthRoute) {
      if (isAdmin) {
        const next = request.nextUrl.searchParams.get("next");
        const url = request.nextUrl.clone();
        url.pathname =
          next && next.startsWith("/admin") ? next : "/admin/dashboard";
        url.searchParams.delete("next");
        url.searchParams.delete("error");
        return NextResponse.redirect(url);
      }
      if (isClinic) {
        const next = request.nextUrl.searchParams.get("next");
        const url = request.nextUrl.clone();
        url.pathname =
          next && next.startsWith("/klinik") ? next : "/klinik/dashboard";
        url.searchParams.delete("next");
        url.searchParams.delete("error");
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
