
import { z } from 'zod';

// Enums for game constants
export const suitSchema = z.enum(['hearts', 'diamonds', 'clubs', 'spades']);
export const cardRankSchema = z.enum(['6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace']);
export const trumpModeSchema = z.enum(['hearts', 'diamonds', 'clubs', 'spades', 'obenabe', 'undenufe', 'schieben']);
export const gameVariationSchema = z.enum(['standard', 'differenzler', 'coiffeur']);
export const gameStatusSchema = z.enum(['waiting', 'trump_selection', 'playing', 'finished', 'cancelled']);
export const playerPositionSchema = z.enum(['north', 'east', 'south', 'west']);
export const difficultyLevelSchema = z.enum(['easy', 'medium', 'hard', 'expert']);
export const cardDesignSchema = z.enum(['swiss_german', 'french']);

// Card schema
export const cardSchema = z.object({
  suit: suitSchema,
  rank: cardRankSchema
});

export type Card = z.infer<typeof cardSchema>;
export type Suit = z.infer<typeof suitSchema>;
export type CardRank = z.infer<typeof cardRankSchema>;
export type TrumpMode = z.infer<typeof trumpModeSchema>;
export type GameVariation = z.infer<typeof gameVariationSchema>;
export type GameStatus = z.infer<typeof gameStatusSchema>;
export type PlayerPosition = z.infer<typeof playerPositionSchema>;
export type DifficultyLevel = z.infer<typeof difficultyLevelSchema>;
export type CardDesign = z.infer<typeof cardDesignSchema>;

// User schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  avatar_url: z.string().nullable(),
  preferred_card_design: cardDesignSchema,
  preferred_difficulty: difficultyLevelSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Game schema
export const gameSchema = z.object({
  id: z.string(),
  variation: gameVariationSchema,
  status: gameStatusSchema,
  current_round: z.number().int(),
  current_trick: z.number().int(),
  trump_mode: trumpModeSchema.nullable(),
  trump_selector_position: playerPositionSchema.nullable(),
  dealer_position: playerPositionSchema,
  current_player_position: playerPositionSchema.nullable(),
  team1_score: z.number().int(),
  team2_score: z.number().int(),
  target_score: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Game = z.infer<typeof gameSchema>;

// Player schema
export const playerSchema = z.object({
  id: z.string(),
  game_id: z.string(),
  user_id: z.string().nullable(),
  position: playerPositionSchema,
  is_ai: z.boolean(),
  ai_difficulty: difficultyLevelSchema.nullable(),
  team: z.number().int(),
  hand: z.array(cardSchema),
  weis_points: z.number().int(),
  created_at: z.coerce.date()
});

export type Player = z.infer<typeof playerSchema>;

// Trick schema
export const trickSchema = z.object({
  id: z.string(),
  game_id: z.string(),
  round_number: z.number().int(),
  trick_number: z.number().int(),
  cards_played: z.array(z.object({
    position: playerPositionSchema,
    card: cardSchema
  })),
  winner_position: playerPositionSchema.nullable(),
  points: z.number().int(),
  created_at: z.coerce.date()
});

export type Trick = z.infer<typeof trickSchema>;

// Weis (meld) schema
export const weisTypeSchema = z.enum(['sequence', 'four_jacks', 'four_nines', 'stoeck']);
export const weisSchema = z.object({
  id: z.string(),
  game_id: z.string(),
  player_position: playerPositionSchema,
  weis_type: weisTypeSchema,
  cards: z.array(cardSchema),
  points: z.number().int(),
  round_number: z.number().int(),
  created_at: z.coerce.date()
});

export type Weis = z.infer<typeof weisSchema>;
export type WeisType = z.infer<typeof weisTypeSchema>;

// Game statistics schema
export const gameStatisticsSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  games_played: z.number().int(),
  games_won: z.number().int(),
  games_lost: z.number().int(),
  total_points_scored: z.number().int(),
  average_points_per_game: z.number(),
  best_game_score: z.number().int(),
  trump_selections: z.number().int(),
  successful_trump_selections: z.number().int(),
  weis_declared: z.number().int(),
  total_weis_points: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type GameStatistics = z.infer<typeof gameStatisticsSchema>;

// Input schemas for API operations

// Create game input
export const createGameInputSchema = z.object({
  variation: gameVariationSchema,
  target_score: z.number().int().positive().default(3000),
  player_user_id: z.string(),
  ai_difficulty: difficultyLevelSchema.default('medium')
});

export type CreateGameInput = z.infer<typeof createGameInputSchema>;

// Join game input
export const joinGameInputSchema = z.object({
  game_id: z.string(),
  user_id: z.string()
});

export type JoinGameInput = z.infer<typeof joinGameInputSchema>;

// Select trump input
export const selectTrumpInputSchema = z.object({
  game_id: z.string(),
  player_position: playerPositionSchema,
  trump_mode: trumpModeSchema
});

export type SelectTrumpInput = z.infer<typeof selectTrumpInputSchema>;

// Play card input
export const playCardInputSchema = z.object({
  game_id: z.string(),
  player_position: playerPositionSchema,
  card: cardSchema
});

export type PlayCardInput = z.infer<typeof playCardInputSchema>;

// Declare weis input
export const declareWeisInputSchema = z.object({
  game_id: z.string(),
  player_position: playerPositionSchema,
  weis_type: weisTypeSchema,
  cards: z.array(cardSchema)
});

export type DeclareWeisInput = z.infer<typeof declareWeisInputSchema>;

// Create user input
export const createUserInputSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  preferred_card_design: cardDesignSchema.default('swiss_german'),
  preferred_difficulty: difficultyLevelSchema.default('medium')
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

// Update user preferences input
export const updateUserPreferencesInputSchema = z.object({
  user_id: z.string(),
  preferred_card_design: cardDesignSchema.optional(),
  preferred_difficulty: difficultyLevelSchema.optional()
});

export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesInputSchema>;

// Game state response schema
export const gameStateSchema = z.object({
  game: gameSchema,
  players: z.array(playerSchema),
  current_trick: trickSchema.nullable(),
  player_hand: z.array(cardSchema).nullable(),
  valid_moves: z.array(cardSchema),
  weis_opportunities: z.array(z.object({
    type: weisTypeSchema,
    cards: z.array(cardSchema),
    points: z.number().int()
  }))
});

export type GameState = z.infer<typeof gameStateSchema>;
