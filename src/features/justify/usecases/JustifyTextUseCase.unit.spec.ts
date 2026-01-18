import { DefaultTextJustifier } from '../domain/core/DefaultTextJustifier';
import { DefaultWordCounter } from '../domain/core/DefaultWordCounter';

describe('JustifyTextUseCase core behavior', () => {
  const justifier = new DefaultTextJustifier();
  const counter = new DefaultWordCounter();

  it('normalizes whitespace and keeps last line left-aligned', () => {
    const result = justifier.justify('hello   world', 80);
    expect(result).toBe('hello world');
  });
  it('normalizes whitespace and keeps last line left-aligned', () => {
    const result = justifier.justify('', 80);
    expect(result).toBe('');
  });
  it('distributes spaces to reach width', () => {
    const text = 'lorem ipsum dolor sit amet';
    const result = justifier.justify(text, 20);
    expect(result.split('\n')[0].length).toBe(20);
  });

  it('counts words after normalization', () => {
    expect(counter.count('  a   b c  ')).toBe(3);
  });

  it('returns 0 on empty string', () => {
    expect(counter.count('   ')).toBe(0);
  });
});
