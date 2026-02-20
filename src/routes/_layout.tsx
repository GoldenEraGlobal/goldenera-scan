import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
    component: RouteComponent
})

function RouteComponent() {
    return (
        <main className="container mx-auto px-4 md:px-8 pb-16 flex-1 mt-10">
            <Outlet />
        </main>
    )
}
