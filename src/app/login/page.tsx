"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { Lock, Mail, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const auth = getAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/") // Redirigir al dashboard
    } catch (err) {
      setError("Credenciales incorrectas. Intenta de nuevo.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center  p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/alenort logo.png" 
              alt="Alenort Logo" 
              className="h-20 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">Bienvenido</CardTitle>
          <p className="text-muted-foreground">Ingresa tus credenciales para continuar</p>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6">
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="flex items-center mb-2">
                <Mail className="mr-2 h-4 w-4" /> Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
            <Label htmlFor="password" className="flex items-center mb-2">
              <Lock className="mr-2 h-4 w-4" /> Contraseña
              </Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={isLoading}
            >
              <LogIn className="mr-2" size={18} />
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}