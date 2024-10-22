import Image from 'next/image'
import { getUser } from "@/lib/signout-action"
import BGGLoginDialog from "@/components/bgg-login";
import { UserProps } from '@/types/gameTypes'

export default async function UserAvatar() {
  const user = await getUser()
  if (!user) return null

  return (
    <div className="flex items-center">
      {user.image && (
        <Image
          src={user.image}
          alt="User Avatar"
          width={50}
          height={50}
          className="rounded-full mr-2.5"
        />
      )}
      <div>
        <h2 className="m-0">{user.name}</h2>
        <p className="m-0">{user.email}</p>
        <p className="m-0">{user.bggUserName}</p>
      </div>
    </div>
  )
}

export function BGGUser({ user }: UserProps) {
  if (!user?.bggUserName) return <BGGLoginDialog />;

  return (
    <div className="bg-[#E7CD78] p-2.5 rounded flex items-center">
      <Image
      src="https://cf.geekdo-static.com/images/logos/navbar-logo-bgg-b2.svg"
      alt="User Avatar"
      width={50}
      height={50}
      className="mr-2.5"
      />
      <p className="text-white">{user.bggUserName}</p>
    </div>
  )
}