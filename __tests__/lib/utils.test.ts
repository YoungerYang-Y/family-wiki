import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles tailwind merge', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});
