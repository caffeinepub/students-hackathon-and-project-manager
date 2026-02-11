import { Link, useRouterState } from '@tanstack/react-router';
import { Home, User, Award, CheckCircle, Search, MessageSquare, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import AuthStatusButton from './AuthStatusButton';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { canVerify } from '../lib/permissions';
import { getBuildDisplayString } from '../lib/buildInfo';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useRouterState({ select: (s) => s.location });
  const { theme, setTheme } = useTheme();
  const { data: profile } = useGetCallerUserProfile();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/achievements', label: 'Achievements', icon: Award },
    ...(profile && canVerify(profile) ? [{ path: '/verification', label: 'Verification', icon: CheckCircle }] : []),
    { path: '/search', label: 'Search', icon: Search },
    { path: '/chat', label: 'AI Assistant', icon: MessageSquare },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
            isActive(item.path)
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <div className="flex items-center gap-3">
                      <img
                        src="/assets/generated/student-innovation-logo.dim_512x512.png"
                        alt="Logo"
                        className="h-10 w-10 rounded-lg"
                      />
                      <div>
                        <h2 className="font-semibold text-sm">Students-project-list-manager.com</h2>
                        <p className="text-xs text-muted-foreground">Innovation Hub</p>
                      </div>
                    </div>
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    <NavLinks />
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-3">
              <img
                src="/assets/generated/student-innovation-logo.dim_512x512.png"
                alt="Logo"
                className="h-9 w-9 rounded-lg"
              />
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg leading-none">Students-project-list-manager.com</h1>
                <p className="text-xs text-muted-foreground">Innovation Hub</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <AuthStatusButton />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-64 border-r bg-card">
          <nav className="flex-1 p-4 space-y-1">
            <NavLinks />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="container px-4">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              © {new Date().getFullYear()} Students-project-list-manager.com. Built with{' '}
              <span className="text-primary">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'students-project-list-manager'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-primary transition-colors"
              >
                caffeine.ai
              </a>
            </p>
            <p className="text-xs opacity-60">
              {getBuildDisplayString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
