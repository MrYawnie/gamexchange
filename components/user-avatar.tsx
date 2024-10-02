import { auth } from "../auth"

export default async function UserAvatar() {
  const session = await auth()

  if (!session || !session.user) return null

  return (
    <div>
      <h2>{session.user.name}</h2>
      <p>{session.user.email}</p>
      <img src={session.user.image} alt="User Avatar" />
    </div>
  )
}