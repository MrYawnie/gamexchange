import { auth } from "../auth"
import Image from 'next/image'

export default async function UserAvatar() {
  const session = await auth()

  if (!session || !session.user) return null

  return (
    <div>
      <h2>{session.user.name}</h2>
      <p>{session.user.email}</p>
      {session.user.image && (
        <Image src={session.user.image} alt="User Avatar" width={50} height={50} />
      )}
    </div>
  )
}