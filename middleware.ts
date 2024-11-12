import { auth as originalAuth } from "@/auth";
import { GetServerSidePropsContext } from "next";

export const middleware = async (req: GetServerSidePropsContext) => {
  return await originalAuth(req);
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
