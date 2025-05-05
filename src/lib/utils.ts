import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine multiple class names into a single string, merging duplicate Tailwind classes.
 * Uses clsx for conditional classes and tailwind-merge to handle Tailwind class conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}