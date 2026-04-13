'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../features/auth/context/AuthProvider'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { Loader2, Info, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showCreds, setShowCreds] = useState(false)
  const { login, user, isLoading } = useAuth()
  const router = useRouter()

  const formRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user && !isLoading) router.replace('/')
  }, [user, isLoading, router])

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    if (leftRef.current) {
      tl.fromTo(leftRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6 })
    }
    if (formRef.current) {
      tl.fromTo(
        formRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.07 },
        '-=0.3'
      )
    }
    if (rightRef.current) {
      tl.fromTo(rightRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.6')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas')
      if (formRef.current) {
        gsap.fromTo(formRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
      }
    }
  }

  const fillCredentials = (emailVal: string, pass: string) => {
    setEmail(emailVal)
    setPassword(pass)
    setShowCreds(false)
  }

  if (isLoading && !error && !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground w-5 h-5" />
      </div>
    )
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-zinc-950">
      <div ref={leftRef} className="relative flex flex-col bg-zinc-950">
        <div className="p-8">
          <div className="flex items-center gap-2.5 text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <span className="text-lg font-semibold tracking-tight">Allsavfe</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div ref={formRef} className="mx-auto flex w-full flex-col space-y-6 sm:w-[380px]">
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Login to your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to login to your account
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors">
                    Forgot your password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-10 font-medium" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full h-10 gap-2 font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              Login with GitHub
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline transition-colors">
                Sign up
              </button>
            </p>
          </div>
        </div>

        <div className="absolute bottom-6 left-6">
          <TooltipProvider delayDuration={0}>
            <div className="relative">
              <Tooltip open={showCreds} onOpenChange={setShowCreds}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setShowCreds(!showCreds)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-200',
                      'border border-border/50 hover:border-border',
                      'text-muted-foreground hover:text-foreground',
                      'bg-zinc-900/50 hover:bg-zinc-900',
                      showCreds && 'border-primary/30 text-foreground bg-zinc-900',
                    )}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Test credentials</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="start"
                  sideOffset={8}
                  className="bg-zinc-900 border border-border text-foreground p-0 w-64 rounded-xl shadow-xl"
                >
                  <div className="p-3 space-y-3">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Demo accounts</p>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => fillCredentials('admin@admin.com', 'test')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left group"
                      >
                        <div>
                          <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">Admin</p>
                          <p className="text-[10px] text-muted-foreground">admin@admin.com</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">test</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fillCredentials('user@user.com', 'test')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left group"
                      >
                        <div>
                          <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">User</p>
                          <p className="text-[10px] text-muted-foreground">user@user.com</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">test</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fillCredentials('basico@user.com', 'test')}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left group"
                      >
                        <div>
                          <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">Básico</p>
                          <p className="text-[10px] text-muted-foreground">basico@user.com</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">test</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60">Click to autofill</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>

      <div ref={rightRef} className="relative hidden lg:flex items-center justify-center bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative flex flex-col items-center gap-4">

          <div className="relative w-32 h-32">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-zinc-700 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-zinc-700 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-zinc-700 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-zinc-700 rounded-br-lg" />

            <svg className="absolute inset-0 w-full h-full text-zinc-800" viewBox="0 0 128 128">
              <line x1="0" y1="0" x2="128" y2="128" stroke="currentColor" strokeWidth="1" />
              <line x1="128" y1="0" x2="0" y2="128" stroke="currentColor" strokeWidth="1" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-3 rounded-full bg-zinc-800/50 ring-1 ring-zinc-700">
                <ImageIcon className="w-6 h-6 text-zinc-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />
      </div>
    </div>
  )
}
