'use client';

import type { MouseEventHandler } from 'react';
import { Coffee } from 'lucide-react';

type Props = {
  onClick: MouseEventHandler<HTMLAnchorElement>;
  iconOnly?: boolean;
};

export function BuyMeACoffeeLink({ onClick, iconOnly = false }: Props) {
  return iconOnly ? (
    <a
      href="https://buymeacoffee.com/f96u"
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="text-gray-500 hover:text-amber-600 transition-colors"
      title="Buy Me a Coffee"
    >
      <Coffee className="h-4 w-4 group-hover:scale-110 transition-transform" />
    </a>
  ) : (
    <a
      href="https://buymeacoffee.com/f96u"
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-gray-500 hover:underline"
      title="Buy Me a Coffee"
    >
      <Coffee className="h-3 w-3" />
      <span className="">開発者にコーヒーを奢る</span>
    </a>
  );
}
