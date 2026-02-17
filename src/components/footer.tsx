import * as m from "@/paraglide/messages"

export function Footer() {
    return (
        <footer className="border-t bg-background py-8">
            <div className="container mx-auto px-4 md:px-8 text-center text-muted-foreground text-sm">
                <p>{m.footer_rights_reserved({ year: new Date().getFullYear().toString() })}</p>
            </div>
        </footer>
    )
}