import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 🔓 Jo pages aap chahte hain ke baghair login ke nazar aayein (jaise Home page '/')
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect(); // 🔒 Sirf baki pages (upload, history, dashboard) par login maangega
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
