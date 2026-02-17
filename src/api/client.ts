import axios from "axios";
import fetch from '@kubb/plugin-client/clients/axios'

export const getClient = () => {
    const client = axios.create({
        baseURL: process.env.NODE_API_URL,
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.NODE_API_KEY,
            "User-Agent": "GE Explorer"
        }
    })

    return client as unknown as typeof fetch
};
