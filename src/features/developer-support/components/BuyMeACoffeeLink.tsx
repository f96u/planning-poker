'use client';

import { Coffee } from 'lucide-react';
import {
  ANALYTICS_EVENTS,
  logAnalyticsEvent,
} from '@/services/analytics';

type Props = {
  sourcePage: 'top' | 'room';
  iconOnly?: boolean;
};

export function BuyMeACoffeeLink({ sourcePage, iconOnly = false }: Props) {
  const handleClick = () => {
    logAnalyticsEvent(ANALYTICS_EVENTS.buyMeACoffeeClicked, {
      source_page: sourcePage,
    });
  };

  return iconOnly ? (
    <a
      href="https://buymeacoffee.com/f96u"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
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
      onClick={handleClick}
      className="inline-flex items-center gap-1 text-gray-500 hover:underline"
      title="Buy Me a Coffee"
    >
      <Coffee className="h-3 w-3" />
      <span className="">開発者にコーヒーを奢る</span>
    </a>
  );
}
