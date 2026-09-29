export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/inbox/:path*", "/alerts/:path*", "/notices/:path*", "/tickets/:path*", "/board/:path*", "/people/:path*"],
};
