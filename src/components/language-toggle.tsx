

import { LanguagesIcon } from "lucide-react"

import { Button } from '@/components/ui/button'
import * as m from "@/paraglide/messages"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getLocale, locales, setLocale } from '@/paraglide/runtime'


export function LanguageToggle() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon">
                    <LanguagesIcon className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">{m.language_toggle_label()}</span>
                </Button>
            } />
            <DropdownMenuContent align="end">
                {locales.map((locale) => (
                    <DropdownMenuItem key={locale} onClick={() => setLocale(locale)} aria-selected={getLocale() === locale}>
                        <span className="uppercase">{locale}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}