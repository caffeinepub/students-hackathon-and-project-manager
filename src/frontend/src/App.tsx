import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppShell from './components/AppShell';
import AuthGate from './components/AuthGate';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AchievementsPage from './pages/AchievementsPage';
import VerificationQueuePage from './pages/VerificationQueuePage';
import SearchPage from './pages/SearchPage';
import ChatbotPage from './pages/ChatbotPage';

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthGate>
        <AppShell>
          <Outlet />
        </AppShell>
      </AuthGate>
      <Toaster />
    </ThemeProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const achievementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/achievements',
  component: AchievementsPage,
});

const verificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verification',
  component: VerificationQueuePage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: ChatbotPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  profileRoute,
  achievementsRoute,
  verificationRoute,
  searchRoute,
  chatRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

