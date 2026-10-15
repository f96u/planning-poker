import { getApp } from 'firebase/app';
import {
  getAnalytics,
  isSupported,
  logEvent,
  type Analytics,
} from 'firebase/analytics';

/** 送信可能なFirebase Analyticsイベント名 */
export const ANALYTICS_EVENTS = {
  roomCreated: 'room_created',
  resultsRevealed: 'results_revealed',
  buyMeACoffeeClicked: 'buy_me_a_coffee_clicked',
} as const

type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

// Analyticsはブラウザでのみ利用できるため、SSR時は初期化しない。
const analyticsPromise: Promise<Analytics | undefined> =
  typeof window === 'undefined'
    ? Promise.resolve(undefined)
    : isSupported()
        .then((supported) => (supported ? getAnalytics(getApp()) : undefined))
        .catch((error: unknown) => {
          console.error('Failed to initialize Firebase Analytics:', error);
          return undefined;
        });

/**
 * Firebase Analytics が利用可能な場合にイベントを送信します。
 * サーバー環境または Analytics 非対応環境では送信しません。
 *
 * @param eventName 送信するイベント名
 * @param eventParams イベントに付加する任意のパラメーター
 */
export function logAnalyticsEvent(
  eventName: AnalyticsEventName,
  eventParams?: Parameters<typeof logEvent>[2],
): void {
  void analyticsPromise.then((analytics) => {
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  });
}
