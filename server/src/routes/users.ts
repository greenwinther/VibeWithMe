import type { ErrorResponse, UserDTO } from "@types";
import { RequestHandler, Router } from "express";
import { prisma } from "src/lib/prisma";

interface UpdateUserBody {
	name?: string;
	avatarUrl?: string;
}

const router = Router();

// Fetch user profile
const getUser: RequestHandler<{ id: string }, UserDTO | ErrorResponse> = async (req, res) => {
	const { id } = req.params;
	const user = await prisma.user.findUnique({
		where: { id },
		select: { id: true, name: true, avatarUrl: true },
	});
	if (!user) {
		const err: ErrorResponse = { error: "User not found" };
		res.status(404).json(err);
		return;
	}
	res.json(user);
};

// Update user profile
const updateUser: RequestHandler<{ id: string }, UserDTO | ErrorResponse, UpdateUserBody> = async (
	req,
	res
) => {
	const { id } = req.params;
	const { name, avatarUrl } = req.body;
	try {
		const updated = await prisma.user.upsert({
			where: { id },
			update: {
				...(name != null && { name }),
				...(avatarUrl != null && { avatarUrl }),
			},
			create: {
				id,
				name: name ?? `User${Math.floor(Math.random() * 1000)}`,
				avatarUrl,
			},
			select: { id: true, name: true, avatarUrl: true },
		});
		res.json(updated);
	} catch (error) {
		console.error(error);
		const err: ErrorResponse = { error: "Could not update or create profile" };
		res.status(500).json(err);
	}
};

router.get("/:id", getUser);
router.put("/:id", updateUser);

export default router;
