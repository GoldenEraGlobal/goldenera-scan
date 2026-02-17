
import { createServerFn } from '@tanstack/react-start'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { getClient } from '@/api/client'
import { apiV1TxGetByHash } from '@/api/gen/clients/apiV1TxGetByHash'
import { apiV1MemTransferGetByHash, apiV1TxGetConfirmationsByHash } from '@/api/gen'
import type { TxDtoV1 } from '@/api/gen'

const TxSchema = z.object({
    hash: z.string().min(1),
})

export type UnifiedTx = TxDtoV1 & { isPending?: boolean, confirmations?: number }

export const getTx = createServerFn()
    .inputValidator(TxSchema)
    .handler(async ({ data }) => {
        const client = getClient();
        try {
            // 1. Try to fetch from confirmed transactions
            const tx = await apiV1TxGetByHash(data.hash, { client })
            if (tx) {
                const confirmations = await apiV1TxGetConfirmationsByHash(data.hash, { client })
                return { ...tx, confirmations, isPending: false } as UnifiedTx
            }
        } catch (e) {
            // Ignore and try mempool
        }

        try {
            // 2. Try to fetch from mempool
            const memTx = await apiV1MemTransferGetByHash(data.hash, { client })
            if (memTx) {
                const unified: UnifiedTx = {
                    hash: memTx.hash,
                    timestamp: memTx.txTimestamp,
                    type: memTx.txType as any,
                    network: memTx.network as any,
                    version: memTx.version as any,
                    nonce: memTx.nonce,
                    sender: memTx.from,
                    recipient: memTx.to,
                    amount: memTx.amount,
                    fee: memTx.fee,
                    tokenAddress: memTx.tokenAddress,
                    message: memTx.message,
                    referenceHash: memTx.referenceHash,
                    signature: memTx.signature,
                    payloadType: memTx.payloadType as any,
                    payload: memTx.payload as any,
                    size: memTx.size,
                    isPending: true,
                    confirmations: undefined,
                }
                return unified
            }
        } catch (e) {
            // Both failed
        }

        return null
    })

export const transactionQueryOptions = (hash: string) =>
    queryOptions({
        queryKey: ['tx-detail', hash],
        queryFn: () => getTx({ data: { hash } }),
        refetchInterval: 10000,
    })

export interface UseTransactionProps {
    hash: string
}

export function useTransaction({ hash }: UseTransactionProps) {
    return useQuery(transactionQueryOptions(hash))
}
