import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import * as m from "@/paraglide/messages"

export function NotFoundCard() {
    return (
        <div className="container mx-auto px-4 py-16 flex items-center justify-center h-[85vh]">
            <Card className="w-full max-w-md shadow-lg border-2 border-muted">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-muted rounded-full p-3 w-fit mb-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{m.not_found_title()}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-muted-foreground">
                        {m.not_found_description()}
                    </p>
                    <Link to="/">
                        <Button className="w-full">
                            {m.not_found_back_home()}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
