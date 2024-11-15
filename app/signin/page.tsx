'use client'

import { useState } from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { Github, Mail, Dices, Users, MessageSquare, BookOpen } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from 'embla-carousel-autoplay'

export default function Component() {
  const [email, setEmail] = useState('')

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    signIn('resend', { email, callbackUrl: '/dashboard' })
  }

  const showcaseItems = [
    {
      title: "Private Game Groups",
      description: "Create and join exclusive groups to share your board game collections with friends and family.",
      image: "/dashboard.png",
    },
    {
      title: "BoardGameGeek Integration",
      description: "Seamlessly sync your BGG collection and see what games your group owns at a glance.",
      image: "/splash-collection.png",
    },
    {
      title: "Easy Game Loans",
      description: "Initiate and track game loans within your group, making sharing a breeze.",
      image: "/group-loan.png",
    },
  ]

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100">
      <div className="flex flex-col justify-center items-center w-full lg:w-1/3 p-8">
        <Card className="bg-white/80 backdrop-blur-sm border-none shadow-xl mb-8 w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center flex items-center justify-center space-x-2">
              <Dices className="w-8 h-8 text-amber-600" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
                GameXchange
              </span>
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Your Board Game Community Hub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 text-center">
              Welcome to GameXchange, where board game enthusiasts connect, share, and play together!
            </p>
            <p className="text-sm text-gray-600 text-center">
              Create private groups, link your BoardGameGeek account, and easily manage your shared game collections. 
              Say goodbye to spreadsheets and hello to seamless game loans within your community!
            </p>
            <div className="flex justify-center space-x-4 my-4">
              <div className="flex flex-col items-center">
                <Users className="w-6 h-6 text-amber-600 mb-2" />
                <span className="text-xs text-gray-600">Private Groups</span>
              </div>
              <div className="flex flex-col items-center">
                <MessageSquare className="w-6 h-6 text-amber-600 mb-2" />
                <span className="text-xs text-gray-600">Group Chat</span>
              </div>
              <div className="flex flex-col items-center">
                <BookOpen className="w-6 h-6 text-amber-600 mb-2" />
                <span className="text-xs text-gray-600">Easy Loans</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full bg-white hover:bg-amber-50 text-gray-800 border-amber-500 hover:border-amber-600 transition-all duration-300"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-white hover:bg-amber-50 text-gray-800 border-amber-500 hover:border-amber-600 transition-all duration-300"
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            >
              <Github className="w-5 h-5 mr-2" />
              Sign in with GitHub
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="bg-white border-amber-500 focus:border-amber-600 text-gray-800 placeholder-gray-400"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all duration-300">
                <Mail className="w-5 h-5 mr-2" />
                Sign in with Email
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="w-full lg:w-2/3 p-4 flex items-center justify-center">
        <Carousel className="w-full max-w-5xl" plugins={[Autoplay({ delay: 5000 })]}>
          <CarouselContent>
            {showcaseItems.map((item, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="w-full">
                    <CardContent className="flex aspect-[16/9] items-center justify-center p-2">
                      <div className="text-center w-full">
                        <div className="relative aspect-[16/9]">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 1200px"
                            className="rounded-lg object-cover"
                            priority
                          />
                        </div>
                        <h3 className="text-2xl font-semibold mt-4 mb-3">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-2" />
          <CarouselNext className="mr-2" />
        </Carousel>
      </div>
    </div>
  )
}