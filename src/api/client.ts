import axios from "axios";
import fetch from '@kubb/plugin-client/clients/axios'
import { createServerOnlyFn } from "@tanstack/react-start";

const getNodeAuthParams = createServerOnlyFn(() => ({
    baseURL: process.env.NODE_API_URL,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.NODE_API_KEY,
        "User-Agent": "GE Explorer"
    }
}))


export const getClient = createServerOnlyFn(() => {
    const client = axios.create(
        getNodeAuthParams()
    )
    return client as unknown as typeof fetch
})
