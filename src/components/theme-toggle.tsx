

import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import * as m from "@/paraglide/messages"

export function ThemeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                    <span className="sr-only">{m.theme_toggle_label()}</span>
                </Button>
            } />
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    {m.theme_light()}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    {m.theme_dark()}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    {m.theme_system()}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}