import { AuthProvider } from "@/hooks/useAuth";
import { AppRouterProvider, useAppRouter } from "@/hooks/useAppRouter";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import BookPage from "./pages/BookPage";
import MyBookings from "./pages/MyBookings";
import AuthPage from "./pages/AuthPage";

const NotFoundView = () => (
  <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">404</p>
    <h1 className="font-display text-4xl font-semibold">Page not found</h1>
    <p className="max-w-md text-muted-foreground">The page you’re looking for doesn’t exist.</p>
  </div>
);

const AppContent = () => {
  const { path } = useAppRouter();

  let page = <NotFoundView />;

  if (path === "/") page = <Index />;
  if (path === "/book") page = <BookPage />;
  if (path === "/my-bookings") page = <MyBookings />;
  if (path === "/auth") page = <AuthPage />;

  return (
    <AuthProvider>
      <Navbar />
      {page}
    </AuthProvider>
  );
};

const App = () => (
  <AppRouterProvider>
    <AppContent />
  </AppRouterProvider>
);

export default App;
