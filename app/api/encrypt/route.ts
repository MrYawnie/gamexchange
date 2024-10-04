// app/api/encrypt/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const secretKey = process.env.BGG_ENCRYPTION_KEY;
if (!secretKey) {
  throw new Error('BGG_ENCRYPTION_KEY is missing from environment');
}

const secretKeyBuffer = Buffer.from(secretKey, 'base64');
const algorithm = 'aes-256-cbc';

export async function POST(request: Request) {
  try {
    const { credentials } = await request.json();

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKeyBuffer, iv);
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return NextResponse.json({ iv: iv.toString('hex'), encryptedData: encrypted });
  } catch (error) {
    return NextResponse.json({ error: 'Encryption failed' }, { status: 500 });
  }
}
