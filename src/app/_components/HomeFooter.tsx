'use client';

import Link from 'next/link';
import { BuyMeACoffeeLink } from '@/features/developer-support';
import {
  ANALYTICS_EVENTS,
  logAnalyticsEvent,
} from '@/services/analytics';

export function HomeFooter() {
  return (
    <footer className="mt-16 py-8 text-center text-gray-500 text-sm">
      <p>© 2025 Scrum Poker Online</p>
      <div className="mt-2 flex items-center justify-center gap-4 flex-wrap">
        <Link href="/terms" className="hover:underline">
          利用規約・プライバシーポリシー
        </Link>
        <BuyMeACoffeeLink
          onClick={() =>
            logAnalyticsEvent(ANALYTICS_EVENTS.buyMeACoffeeClicked, {
              source_page: 'top',
            })
          }
        />
      </div>
    </footer>
  );
}
