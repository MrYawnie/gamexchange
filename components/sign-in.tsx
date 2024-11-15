
import { signIn } from "@/auth"
import { auth } from "@/auth"
 
export async function SignIn() {
    const session = auth()

    if (await session) return null

    return (
      <form
        action={async () => {
          "use server"
          await signIn()
        }}
      >
        <button type="submit" className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44">Login</button>
      </form>
    )
  }

export function SignInWithGoogle() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google", { redirectTo: "/dashboard" })
      }}
    >
      <button type="submit">Signin with Google</button>
    </form>
  )
}

export function SignInWithGitHub() {
    return (
      <form
        action={async () => {
          "use server"
          await signIn("github", { redirectTo: "/dashboard" })
        }}
      >
        <button type="submit">Signin with GitHub</button>
      </form>
    )
  } 