import {setGlobalOptions} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/scheduler";

setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();

/**
 * 24時間以上経過したルームを削除
 */
export const cleanupOldRooms = onSchedule(
  {
    schedule: 'every day 04:00',
    timeZone: 'Asia/Tokyo',
  },
  async (event) => {
    const db = admin.database();
    const roomsRef = db.ref('rooms');

    // 24時間以上経過したルームを削除
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;
    try {
      const snapshot = await roomsRef
        .orderByChild('createdAt')
        .endAt(cutoff)
        .once('value');
      if (!snapshot.exists()) {
        logger.info('削除対象の古い部屋はありませんでした。')
        return;
      }
      const updates: { [key: string]: null } = {};
      snapshot.forEach(child => {
        updates[child.key] = null;
      })

      await roomsRef.update(updates);
      logger.info(`${Object.keys(updates).length}件の古い部屋を削除しました。`)
    } catch (error) {
      logger.error('古い部屋の削除中にエラーが発生しました。', error);
    }
  }
)

