import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Extracting the username and password from the request body
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Prepare the request to the BGG login API
    const bggLoginResponse = await fetch('https://boardgamegeek.com/login/api/v1', {
      method: 'POST',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-FI,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/json',
        'dnt': '1',
        'origin': 'https://boardgamegeek.com',
        'priority': 'u=1, i',
        'referer': 'https://boardgamegeek.com/',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        credentials: { username, password },
      }),
    });

    // Check if the login was successful
    if (bggLoginResponse.status === 204) {
      // Extract the 'bggusername' cookie from the response headers
      const cookies = bggLoginResponse.headers.getSetCookie();
      let bggUsernameCookie = cookies.find(cookie => cookie.startsWith('bggusername='));
      if (bggUsernameCookie) {
        // Optionally, you can trim the cookie content if necessary
        bggUsernameCookie = bggUsernameCookie.split(';')[0]; // This gets just the cookie value, excluding path, expires, etc.
        const cookieValue = bggUsernameCookie.split('=')[1];

        try {
          await prisma.user.update({
            where: { email: session.user.email as string },
            data: { bggUserName: cookieValue },
          });
          return NextResponse.json({ bggUsername: cookieValue }, { status: 200 });
        } catch (error) {
          console.log('Error saving BGG username:', error);
          return NextResponse.json({ error: 'Failed to save BGG username' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'BGG username not found in response headers' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Failed to authenticate with BGG' }, { status: bggLoginResponse.status });
    }
  } catch (error) {
    console.log('Error during BGG login:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
