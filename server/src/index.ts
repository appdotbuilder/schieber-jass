
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import {
  createUserInputSchema,
  updateUserPreferencesInputSchema,
  createGameInputSchema,
  joinGameInputSchema,
  selectTrumpInputSchema,
  playCardInputSchema,
  declareWeisInputSchema
} from './schema';
import { createUser } from './handlers/create_user';
import { updateUserPreferences } from './handlers/update_user_preferences';
import { createGame } from './handlers/create_game';
import { joinGame } from './handlers/join_game';
import { getGameState } from './handlers/get_game_state';
import { selectTrump } from './handlers/select_trump';
import { playCard } from './handlers/play_card';
import { declareWeis } from './handlers/declare_weis';
import { getUserStatistics } from './handlers/get_user_statistics';
import { calculateAiMove } from './handlers/ai_move';
import { getValidMoves } from './handlers/get_valid_moves';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  updateUserPreferences: publicProcedure
    .input(updateUserPreferencesInputSchema)
    .mutation(({ input }) => updateUserPreferences(input)),

  getUserStatistics: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => getUserStatistics(input.userId)),

  // Game management
  createGame: publicProcedure
    .input(createGameInputSchema)
    .mutation(({ input }) => createGame(input)),

  joinGame: publicProcedure
    .input(joinGameInputSchema)
    .mutation(({ input }) => joinGame(input)),

  getGameState: publicProcedure
    .input(z.object({ gameId: z.string(), userId: z.string().optional() }))
    .query(({ input }) => getGameState(input.gameId, input.userId)),

  // Game actions
  selectTrump: publicProcedure
    .input(selectTrumpInputSchema)
    .mutation(({ input }) => selectTrump(input)),

  playCard: publicProcedure
    .input(playCardInputSchema)
    .mutation(({ input }) => playCard(input)),

  declareWeis: publicProcedure
    .input(declareWeisInputSchema)
    .mutation(({ input }) => declareWeis(input)),

  // AI and game logic
  getValidMoves: publicProcedure
    .input(z.object({ gameId: z.string(), playerPosition: z.string() }))
    .query(async ({ input }) => {
      const gameState = await getGameState(input.gameId);
      return getValidMoves(gameState, input.playerPosition);
    }),

  calculateAiMove: publicProcedure
    .input(z.object({
      gameId: z.string(),
      playerPosition: z.string(),
      difficulty: z.string()
    }))
    .mutation(async ({ input }) => {
      const gameState = await getGameState(input.gameId);
      return calculateAiMove(gameState, input.playerPosition, input.difficulty);
    })
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Schieber TRPC server listening at port: ${port}`);
}

start();
