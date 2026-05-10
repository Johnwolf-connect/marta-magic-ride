import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { BottomNav } from "@/components/BottomNav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This stop isn't on the map.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
          Back to Pulse
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">A small detour</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message || "Something went wrong on our end."}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" },
      { name: "theme-color", content: "#0f1420" },
      { title: "Pulse — MARTA, predicted." },
      { name: "description", content: "The MARTA companion that knows where you're going. Live tracking, fare-aware routing, one-tap share." },
      { property: "og:title", content: "Pulse — MARTA, predicted." },
      { property: "og:description", content: "The MARTA companion that knows where you're going. Live tracking, fare-aware routing, one-tap share." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Pulse — MARTA, predicted." },
      { name: "twitter:description", content: "The MARTA companion that knows where you're going. Live tracking, fare-aware routing, one-tap share." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/084371db-5283-40ac-be77-eab14d3c73eb/id-preview-479e7e8f--c3f032c5-eec1-4738-8a9e-3299f89b3f51.lovable.app-1778372670042.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/084371db-5283-40ac-be77-eab14d3c73eb/id-preview-479e7e8f--c3f032c5-eec1-4738-8a9e-3299f89b3f51.lovable.app-1778372670042.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative mx-auto min-h-screen max-w-md bg-background pb-28">
        <Outlet />
      </div>
      <BottomNav />
      <Toaster position="top-center" theme="dark" />
    </QueryClientProvider>
  );
}
