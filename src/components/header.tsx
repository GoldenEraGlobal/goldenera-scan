import { Menu, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Link, useLoaderData } from "@tanstack/react-router";
import { LanguageToggle } from "./language-toggle";
import * as m from "@/paraglide/messages"

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const APP_NAME = useLoaderData({ from: "__root__", select: (state) => state.APP_NAME || 'GoldenEra Scan' })
    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between relative">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="p-1 rounded">
                            <img src="/apple-icon-144x144.png" width={144} height={144} alt={`${APP_NAME} logo`} className="h-8 w-8" />
                        </div>
                        <span className="text-base truncate sm:text-lg font-medium tracking-tight">{APP_NAME}</span>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden lg:flex items-center gap-6 text-sm font-medium absolute left-1/2 -translate-x-1/2">
                        <Link to="/" className="hover:text-primary transition-colors [&.active]:text-primary">{m.header_home()}</Link>
                        <Link to="/transactions" className="hover:text-primary transition-colors [&.active]:text-primary">{m.header_transactions()}</Link>
                        <Link to="/mempool" className="hover:text-primary transition-colors [&.active]:text-primary">{m.header_mempool()}</Link>
                        <Link to="/blocks" className="hover:text-primary transition-colors [&.active]:text-primary">{m.header_blocks()}</Link>
                        <Link to="/accounts" className="hover:text-primary transition-colors [&.active]:text-primary">{m.header_accounts()}</Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        <ThemeToggle />

                        {/* Mobile Menu Button */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="relative w-3/4 max-w-sm bg-background/95 backdrop-blur h-full border-l p-6 shadow-xl animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-lg font-bold">{m.header_menu()}</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <XIcon className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="flex flex-col gap-4 text-base font-medium">
                            <Link to="/" className="py-2 border-b hover:text-primary [&.active]:text-primary" onClick={() => setIsMobileMenuOpen(false)}>{m.header_home()}</Link>
                            <Link to="/transactions" className="py-2 border-b hover:text-primary [&.active]:text-primary" onClick={() => setIsMobileMenuOpen(false)}>{m.header_transactions()}</Link>
                            <Link to="/mempool" className="py-2 border-b hover:text-primary [&.active]:text-primary" onClick={() => setIsMobileMenuOpen(false)}>{m.header_mempool()}</Link>
                            <Link to="/blocks" className="py-2 border-b hover:text-primary [&.active]:text-primary" onClick={() => setIsMobileMenuOpen(false)}>{m.header_blocks()}</Link>
                            <Link to="/accounts" className="py-2 border-b hover:text-primary [&.active]:text-primary" onClick={() => setIsMobileMenuOpen(false)}>{m.header_accounts()}</Link>
                        </nav>
                    </div>
                </div>
            )}
        </>
    )
}