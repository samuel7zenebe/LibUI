import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "../components/SignUp";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full h-fit">
      <SignUp />
    </div>
  );
}
