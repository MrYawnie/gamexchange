import { auth } from "../auth"
import Image from 'next/image'

export default async function UserAvatar() {
  const session = await auth()

  if (!session || !session.user) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {session.user.image && (
      <Image
        src={session.user.image}
        alt="User Avatar"
        width={50}
        height={50}
        style={{ borderRadius: '50%', marginRight: '10px' }}
      />
      )}
      <div>
      <h2 style={{ margin: 0 }}>{session.user.name}</h2>
      <p style={{ margin: 0 }}>{session.user.email}</p>
      <p style={{ margin: 0 }}>{session.user.bggUserName}</p>
      </div>
    </div>
  )
}

export async function BGGUser() {
  const session = await auth()

  if (!session || !session.user) return null

  return (
    <div style={{ backgroundColor: '#E7CD78', padding: '10px', borderRadius: '5px', display: 'flex' }}>
      <Image
      src="https://cf.geekdo-static.com/images/logos/navbar-logo-bgg-b2.svg"
      alt="User Avatar"
      width={50}
      height={50}
      style={{ marginRight: '10px'}}
      />
      <p style={{ color: 'white' }}>{session.user.bggUserName}</p>
    </div>
  )
}