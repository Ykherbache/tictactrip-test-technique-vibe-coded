import { injectable } from 'inversify';
import { TextJustifier } from '../adapters/secondary/TextJustifier';
import { normalizeWhitespace } from '../../../../shared/textUtils';

@injectable()
export class DefaultTextJustifier implements TextJustifier {
  justify(text: string, width: number): string {
    const normalized = normalizeWhitespace(text);
    if (!normalized) return '';
    const words = normalized.split(' ');
    const lines: string[][] = [];
    let current: string[] = [];
    let length = 0;

    for (const word of words) {
      if (current.length === 0) {
        current.push(word);
        length = word.length;
        continue;
      }
      if (length + 1 + word.length <= width) {
        current.push(word);
        length += 1 + word.length;
      } else {
        lines.push(current);
        current = [word];
        length = word.length;
      }
    }
    if (current.length) lines.push(current);

    return lines
      .map((lineWords, idx) => {
        const isLast = idx === lines.length - 1;
        if (lineWords.length === 1 || isLast) {
          return lineWords.join(' ');
        }
        const totalChars = lineWords.reduce((sum, w) => sum + w.length, 0);
        const spacesNeeded = width - totalChars;
        const gaps = lineWords.length - 1;
        const base = Math.floor(spacesNeeded / gaps);
        let extra = spacesNeeded % gaps;
        return lineWords
          .map((w, i) => {
            if (i === lineWords.length - 1) return w;
            const spaces = base + (extra > 0 ? 1 : 0);
            if (extra > 0) extra -= 1;
            return w + ' '.repeat(spaces);
          })
          .join('');
      })
      .join('\n');
  }
}
