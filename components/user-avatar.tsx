import { auth } from "@/auth"
import Image from 'next/image'

export default async function UserAvatar() {
  const session = await auth()

  if (!session || !session.user) return null

  return (
    <div className="flex items-center">
      {session.user.image && (
        <Image
          src={session.user.image}
          alt="User Avatar"
          width={50}
          height={50}
          className="rounded-full mr-2.5"
        />
      )}
      <div>
        <h2 className="m-0">{session.user.name}</h2>
        <p className="m-0">{session.user.email}</p>
        <p className="m-0">{session.user.bggUserName}</p>
      </div>
    </div>
  )
}

export async function BGGUser() {
  const session = await auth()

  if (!session || !session.user) return null

  return (
    <div className="bg-[#E7CD78] p-2.5 rounded flex items-center">
      <Image
      src="https://cf.geekdo-static.com/images/logos/navbar-logo-bgg-b2.svg"
      alt="User Avatar"
      width={50}
      height={50}
      className="mr-2.5"
      />
      <p className="text-white">{session.user.bggUserName}</p>
    </div>
  )
}