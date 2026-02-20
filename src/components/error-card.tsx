import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Link, useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import * as m from "@/paraglide/messages"

export function ErrorCard({ error, reset }: { error?: Error, reset?: () => void }) {
    const router = useRouter()

    return (
        <div className="container mx-auto px-4 py-16 flex items-center justify-center h-[85vh]">
            <Card className="w-full max-w-md shadow-lg border-2 border-destructive">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-destructive/10 rounded-full p-3 w-fit mb-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{m.error_card_title()}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-muted-foreground wrap-break-word text-sm">
                        {error?.message || m.error_card_description()}
                    </p>
                    <div className="flex flex-col gap-2 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (reset) reset()
                                router.invalidate()
                            }}
                            className="w-full"
                        >
                            {m.error_card_retry()}
                        </Button>
                        <Link to="/" className="w-full">
                            <Button className="w-full">
                                {m.error_card_home()}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
