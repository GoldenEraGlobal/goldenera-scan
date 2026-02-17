import * as m from "@/paraglide/messages"
import { useLoaderData } from "@tanstack/react-router"

export function Footer() {
    const APP_NAME = useLoaderData({ from: "__root__", select: (state) => state.APP_NAME || 'GoldenEra Scan' })

    return (
        <footer className="border-t bg-background py-8">
            <div className="container mx-auto px-4 md:px-8 text-center text-muted-foreground text-sm">
                <p>{m.footer_rights_reserved({ year: new Date().getFullYear().toString(), appName: APP_NAME })}</p>
            </div>
        </footer>
    )
}