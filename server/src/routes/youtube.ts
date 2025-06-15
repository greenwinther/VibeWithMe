import { RequestHandler, Router } from "express";
import { google } from "googleapis";

import type { ErrorResponse, VideoDTO } from "@types";

const router = Router();
const youtube = google.youtube({
	version: "v3",
	auth: process.env.YOUTUBE_API_KEY,
});

// youtube-search?q=... Proxy to YouTube Data API; returns an array of VideoDTO or an ErrorResponse.
const searchVideos: RequestHandler<{}, VideoDTO[] | ErrorResponse, any, { q?: string }> = async (
	req,
	res
) => {
	const q = String(req.query.q || "");
	if (!q.trim()) {
		const err: ErrorResponse = { error: "Missing q parameter" };
		res.status(400).json(err);
		return;
	}

	try {
		const response = await youtube.search.list({
			part: ["snippet"],
			q,
			maxResults: 5,
			type: ["video"],
		});

		const items: VideoDTO[] =
			response.data.items?.map((item) => ({
				videoId: item.id?.videoId!,
				title: item.snippet?.title!,
				thumbnail: item.snippet?.thumbnails?.default?.url!,
			})) || [];

		res.json(items);
	} catch (err) {
		console.error("YouTube search failed", err);
		const errorRes: ErrorResponse = { error: "YouTube search error" };
		res.status(500).json(errorRes);
	}
};

router.get("/", searchVideos);

export default router;
