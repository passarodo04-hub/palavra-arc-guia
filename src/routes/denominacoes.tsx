import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/denominacoes")({ component: () => <Outlet /> });