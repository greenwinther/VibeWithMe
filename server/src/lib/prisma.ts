/**
 * Exports a single shared PrismaClient instance
 * to be used across route handlers and socket logic.
 */

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
