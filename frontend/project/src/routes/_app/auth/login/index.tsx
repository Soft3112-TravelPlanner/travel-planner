import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/auth/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_app/auth/login/"!</div>;
}
