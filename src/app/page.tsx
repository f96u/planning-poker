'use client';
import { ref, push, serverTimestamp, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const createRoom = async () => {
    const newRoomRef = push(ref(db, 'rooms'))
    await set(newRoomRef, {
      createdAt: serverTimestamp(),
      status: 'voting', // voting, revealed
      users: {}
    });

    const roomId = newRoomRef.key;
    router.push(`/room/${roomId}`);
  }

  return (
    <div>
      <h1>Planning Poker</h1>
      <button onClick={createRoom}>Create Room</button>
    </div>
  );
}
