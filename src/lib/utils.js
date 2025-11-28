/**
 * Utility functions
 * 
 * @package SureFeedback
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 * 
 * @param {...(string|object|Array)} classes - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...classes) {
  return twMerge(clsx(classes));
}

export default { cn };

