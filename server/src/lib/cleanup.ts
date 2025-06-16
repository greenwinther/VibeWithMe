import { prisma } from "./prisma";

// how long before a room is considered stale (1000 * 60 * 60 * 24) (24 hrs)
const INACTIVITY_THRESHOLD_MS = 1000 * 60; // 60 seconds

export async function cleanupStaleRooms() {
	const cutoff = new Date(Date.now() - INACTIVITY_THRESHOLD_MS);

	// find stale room IDs
	const stale = await prisma.room.findMany({
		where: { lastActive: { lt: cutoff } },
		select: { id: true },
	});
	if (stale.length === 0) {
		console.log("cleanup: no stale rooms found");
		return;
	}
	const roomIds = stale.map((r) => r.id);

	// delete associated records first
	await prisma.message.deleteMany({ where: { roomId: { in: roomIds } } });
	await prisma.video.deleteMany({ where: { roomId: { in: roomIds } } });
	await prisma.roomParticipant.deleteMany({ where: { roomId: { in: roomIds } } });

	// finally delete the rooms themselves
	const result = await prisma.room.deleteMany({ where: { id: { in: roomIds } } });
	console.log(`cleanup: deleted ${result.count} stale rooms`);
}
