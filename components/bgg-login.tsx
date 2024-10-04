'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;

export default function BGGLoginDialog() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>): Promise<boolean> => {
    event.preventDefault();
    const credentials = { username, password };

    try {
      // Encrypt credentials using the server-side API route
      const response = await fetch('/api/encrypt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credentials }),
      });

      const { iv, encryptedData } = await response.json();

      // Send encrypted credentials to the login endpoint
      const loginResponse = await fetch(`${API_SERVER_URL}/bgg/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iv, encryptedData }),
      });

      if (loginResponse.status === 200) {
        const responseData = await loginResponse.json();
        const bggUsername = responseData.bggusername;

        // Save the BGG username to the user's account
        const saveResponse = await fetch('/api/user/bgg-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bggUsername }),
        });

        if (saveResponse.status === 200) {
          console.log('BGG username saved successfully:', bggUsername);
          setIsOpen(false);
          return true;
        } else {
          const data = await saveResponse.json();
          console.log('Failed to save BGG username:', data.error);
          return false;
        }
      } else {
        const data = await loginResponse.json();
        console.log('Login failed:', data);
        return false;
      }
    } catch (err) {
      console.error('Error during login:', err);
      return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Link BGG account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Login</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => handleLogin(event)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Login</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}