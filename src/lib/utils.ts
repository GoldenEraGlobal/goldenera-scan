import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Address, NATIVE_TOKEN, ZERO_ADDRESS, ZERO_HASH } from "@goldenera/cryptoj"

const formatter = new Intl.NumberFormat('en-US');

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shortens an address to a more readable format
 * @param address - The full address string
 * @param startChars - Number of characters to show at the start (default: 6)
 * @param endChars - Number of characters to show at the end (default: 4)
 * @returns Shortened address like "0x1234...abcd"
 */
export const shortenAddress = (
  address: string | null | undefined,
  startChars: number = 6,
  endChars: number = 4
): string => {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Checks if an address is a null/zero address
 * @param address - The address to check
 * @returns True if the address is null or a zero address (0x000...)
 */
export const isNullAddress = (address: string | null | undefined): boolean => {
  if (!address) return true
  if (isZeroAddress(address)) return true
  // Check for common null address patterns
  const nullPatterns = [
    /^0x0+$/i,
    /^0x0{40}$/i,
  ]
  return nullPatterns.some(pattern => pattern.test(address))
}

export const isNullHash = (hash: string | null | undefined): boolean => {
  if (!hash) return true
  if (isZeroHash(hash)) return true
  // Check for common null hash patterns
  const nullPatterns = [
    /^0x0+$/i,
    /^0x0{64}$/i,
  ]
  return nullPatterns.some(pattern => pattern.test(hash))
}

export const formatWei = (weiStr: string | undefined | null, decimals: number = 8): string => {
  if (weiStr === undefined || weiStr === null) return '-'
  try {
    const wei = BigInt(weiStr)
    const divisor = BigInt(10 ** decimals)
    const whole = wei / divisor
    const fraction = wei % divisor
    const fractionStr = fraction.toString().padStart(decimals, '0')

    return `${formatter.format(whole)}.${fractionStr}`
  } catch {
    return '-'
  }
}

export const formatNum = (num: number | undefined | null | string | bigint): string => {
  if (num === undefined || num === null) return '-'
  if (typeof num === 'number' || typeof num === 'bigint') {
    return formatter.format(num)
  }
  if (typeof num === 'string') {
    return formatter.format(parseFloat(num))
  }
  return '-'
}

// Format transfer type for display
export const formatTransferType = (type: string | undefined): string => {
  if (!type) return 'Transfer'
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const formatPayloadType = (type: string | undefined): string => {
  if (!type) return 'N/A'
  return type
    .replace(/^BIP_/, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const isNativeToken = (address?: string | null | Address): boolean => {
  return compareAddress(address, NATIVE_TOKEN)
}

export const isZeroAddress = (address?: string | null | Address): boolean => {
  return compareAddress(address, ZERO_ADDRESS)
}

export const isZeroHash = (hash?: string | null | Address): boolean => {
  return compareAddress(hash, ZERO_HASH)
}

export const compareAddress = (address?: string | null | Address, otherAddress?: string | null | Address): boolean => {
  if (typeof address !== 'string' || typeof otherAddress !== 'string') {
    return false;
  }
  return address.toLowerCase().trim() === otherAddress.toLowerCase().trim()
}

/**
 * Attempts to parse a hex string as UTF-8 text.
 * @param hex - The hex string (with or without 0x prefix)
 * @returns The decoded string or null if invalid
 */
export const hexToUtf8 = (hex: string | undefined | null): string | null => {
  if (!hex || hex === '0x') return null
  try {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
    // Check if it's a valid hex string
    if (!/^[0-9a-fA-F]*$/.test(cleanHex)) return null
    if (cleanHex.length % 2 !== 0) return null

    const bytes = new Uint8Array(cleanHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
    const decoder = new TextDecoder('utf-8', { fatal: true })
    return decoder.decode(bytes)
  } catch {
    return null
  }
}