
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { signInAsGuest } = useAuth();
  const router = useRouter();
  return (
    <div className="relative min-h-screen w-full bg-background text-white">
      {/* Background Gradient & Grid */}
      <div
        className="absolute inset-0 z-0 opacity-50"
        style={{ 
          backgroundImage: "linear-gradient(to bottom, #1a0f30, #0c0517), radial-gradient(circle at top left, rgba(128, 0, 128, 0.2), transparent 40%), radial-gradient(circle at bottom right, rgba(128, 0, 128, 0.2), transparent 40%)",
        }}
      ></div>
       <div 
        className="absolute inset-0 z-10 opacity-20" 
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      }}></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/80 to-transparent"></div>

      {/* Content */}
      <div className="relative z-20 flex min-h-screen flex-col">
        {/* Header */}
        <header className="container mx-auto flex items-center justify-between p-4 md:p-6">
          <Logo className="text-3xl tracking-widest" />
          <nav className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden md:block">Don't have an account?</p>
            <Button variant="outline" asChild className="rounded-md border-primary/50 bg-primary/10 text-white hover:bg-primary/20 hover:text-white">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </header>

        {/* Main Section */}
        <main className="container mx-auto flex flex-1 items-center p-4 md:p-6">
          <div className="grid w-full grid-cols-1 gap-16 md:grid-cols-2">
            
            {/* Left Side: Login Form */}
            <div className="flex flex-col justify-center rounded-lg border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur-lg">
              <h1 className="text-5xl font-black tracking-widest uppercase">Sign In</h1>
              <p className="mt-2 text-muted-foreground">Welcome back to the universe of cinema.</p>
              <div className="mt-8">
                <LoginForm />
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">or</span>
                  <Button
                    variant="secondary"
                    className="ml-auto"
                    onClick={() => {
                      signInAsGuest();
                      router.push('/');
                    }}
                  >
                    Continue as Guest
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side: Hero Text */}
            <div className="hidden flex-col items-start justify-center text-right md:flex">
                <h2 className="text-6xl font-black uppercase tracking-[0.3em] lg:text-8xl">
                    CINEMA
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Discover, discuss, and dive into the world of film.
                </p>
                <Button variant="link" asChild className="mt-4 text-lg text-primary hover:text-primary/80">
                    <Link href="/">Explore Now &rarr;</Link>
                </Button>
            </div>
          </div>
        </main>
        
         {/* Footer Stats */}
        <footer className="container mx-auto p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left border-t border-white/10 pt-6">
                <div>
                    <p className="text-3xl font-bold text-primary">1M+</p>
                    <p className="text-sm uppercase tracking-widest text-muted-foreground">Movies</p>
                </div>
                 <div>
                    <p className="text-3xl font-bold text-primary">500K+</p>
                    <p className="text-sm uppercase tracking-widest text-muted-foreground">Members</p>
                </div>
                 <div>
                    <p className="text-3xl font-bold text-primary">10K+</p>
                    <p className="text-sm uppercase tracking-widest text-muted-foreground">Reviews</p>
                </div>
                 <div>
                    <p className="text-3xl font-bold text-primary">24/7</p>
                    <p className="text-sm uppercase tracking-widest text-muted-foreground">Community</p>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}
