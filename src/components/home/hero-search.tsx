import { SearchInput } from "./search-input";
import { ClientOnly } from '@tanstack/react-router'
import { Spinner } from "../ui/spinner";
import * as m from "@/paraglide/messages"

const APP_NAME = import.meta.env.VITE_APP_NAME || 'GE Explorer'

export function HeroSearch() {
    return (
        <section className="relative bg-slate-900 text-slate-50 py-24 px-4 md:px-8 overflow-hidden">
            {/* Abstract Background pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto relative z-10 max-w-5xl flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-sky-300 to-indigo-400">
                    {m.hero_title({ appName: APP_NAME })}
                </h1>
                <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
                    {m.hero_subtitle({ appName: APP_NAME })}
                </p>

                {/* Search Input */}
                <div className="bg-background rounded-xl p-1.5 flex items-center shadow-lg w-full max-w-2xl mb-8">
                    <ClientOnly fallback={<div className="w-full h-12 flex items-center justify-center"><Spinner className="size-5 mr-2" /> {m.common_loading()}</div>}>
                        <SearchInput className="border-0 bg-background! shadow-none focus-visible:ring-0 text-foreground h-12 text-base w-full"
                            placeholder={m.common_search_placeholder()}
                        />
                    </ClientOnly>
                </div>
            </div>
        </section>
    );
}
