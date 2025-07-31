
import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const suitEnum = pgEnum('suit', ['hearts', 'diamonds', 'clubs', 'spades']);
export const cardRankEnum = pgEnum('card_rank', ['6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace']);
export const trumpModeEnum = pgEnum('trump_mode', ['hearts', 'diamonds', 'clubs', 'spades', 'obenabe', 'undenufe', 'schieben']);
export const gameVariationEnum = pgEnum('game_variation', ['standard', 'differenzler', 'coiffeur']);
export const gameStatusEnum = pgEnum('game_status', ['waiting', 'trump_selection', 'playing', 'finished', 'cancelled']);
export const playerPositionEnum = pgEnum('player_position', ['north', 'east', 'south', 'west']);
export const difficultyLevelEnum = pgEnum('difficulty_level', ['easy', 'medium', 'hard', 'expert']);
export const cardDesignEnum = pgEnum('card_design', ['swiss_german', 'french']);
export const weisTypeEnum = pgEnum('weis_type', ['sequence', 'four_jacks', 'four_nines', 'stoeck']);

// Users table
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  avatar_url: text('avatar_url'),
  preferred_card_design: cardDesignEnum('preferred_card_design').notNull().default('swiss_german'),
  preferred_difficulty: difficultyLevelEnum('preferred_difficulty').notNull().default('medium'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Games table
export const gamesTable = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  variation: gameVariationEnum('variation').notNull(),
  status: gameStatusEnum('status').notNull().default('waiting'),
  current_round: integer('current_round').notNull().default(1),
  current_trick: integer('current_trick').notNull().default(1),
  trump_mode: trumpModeEnum('trump_mode'),
  trump_selector_position: playerPositionEnum('trump_selector_position'),
  dealer_position: playerPositionEnum('dealer_position').notNull(),
  current_player_position: playerPositionEnum('current_player_position'),
  team1_score: integer('team1_score').notNull().default(0),
  team2_score: integer('team2_score').notNull().default(0),
  target_score: integer('target_score').notNull().default(3000),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Players table
export const playersTable = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  game_id: uuid('game_id').notNull().references(() => gamesTable.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').references(() => usersTable.id, { onDelete: 'set null' }),
  position: playerPositionEnum('position').notNull(),
  is_ai: boolean('is_ai').notNull().default(false),
  ai_difficulty: difficultyLevelEnum('ai_difficulty'),
  team: integer('team').notNull(), // 1 or 2
  hand: jsonb('hand').notNull().default('[]'), // Array of cards
  weis_points: integer('weis_points').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Tricks table
export const tricksTable = pgTable('tricks', {
  id: uuid('id').primaryKey().defaultRandom(),
  game_id: uuid('game_id').notNull().references(() => gamesTable.id, { onDelete: 'cascade' }),
  round_number: integer('round_number').notNull(),
  trick_number: integer('trick_number').notNull(),
  cards_played: jsonb('cards_played').notNull().default('[]'), // Array of {position, card}
  winner_position: playerPositionEnum('winner_position'),
  points: integer('points').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Weis (melds) table
export const weisTable = pgTable('weis', {
  id: uuid('id').primaryKey().defaultRandom(),
  game_id: uuid('game_id').notNull().references(() => gamesTable.id, { onDelete: 'cascade' }),
  player_position: playerPositionEnum('player_position').notNull(),
  weis_type: weisTypeEnum('weis_type').notNull(),
  cards: jsonb('cards').notNull(), // Array of cards
  points: integer('points').notNull(),
  round_number: integer('round_number').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Game statistics table
export const gameStatisticsTable = pgTable('game_statistics', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  games_played: integer('games_played').notNull().default(0),
  games_won: integer('games_won').notNull().default(0),
  games_lost: integer('games_lost').notNull().default(0),
  total_points_scored: integer('total_points_scored').notNull().default(0),
  average_points_per_game: integer('average_points_per_game').notNull().default(0),
  best_game_score: integer('best_game_score').notNull().default(0),
  trump_selections: integer('trump_selections').notNull().default(0),
  successful_trump_selections: integer('successful_trump_selections').notNull().default(0),
  weis_declared: integer('weis_declared').notNull().default(0),
  total_weis_points: integer('total_weis_points').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many, one }) => ({
  players: many(playersTable),
  statistics: one(gameStatisticsTable, {
    fields: [usersTable.id],
    references: [gameStatisticsTable.user_id]
  })
}));

export const gamesRelations = relations(gamesTable, ({ many }) => ({
  players: many(playersTable),
  tricks: many(tricksTable),
  weis: many(weisTable)
}));

export const playersRelations = relations(playersTable, ({ one }) => ({
  game: one(gamesTable, {
    fields: [playersTable.game_id],
    references: [gamesTable.id]
  }),
  user: one(usersTable, {
    fields: [playersTable.user_id],
    references: [usersTable.id]
  })
}));

export const tricksRelations = relations(tricksTable, ({ one }) => ({
  game: one(gamesTable, {
    fields: [tricksTable.game_id],
    references: [gamesTable.id]
  })
}));

export const weisRelations = relations(weisTable, ({ one }) => ({
  game: one(gamesTable, {
    fields: [weisTable.game_id],
    references: [gamesTable.id]
  })
}));

export const gameStatisticsRelations = relations(gameStatisticsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [gameStatisticsTable.user_id],
    references: [usersTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  games: gamesTable,
  players: playersTable,
  tricks: tricksTable,
  weis: weisTable,
  gameStatistics: gameStatisticsTable
};

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Game = typeof gamesTable.$inferSelect;
export type NewGame = typeof gamesTable.$inferInsert;
export type Player = typeof playersTable.$inferSelect;
export type NewPlayer = typeof playersTable.$inferInsert;
export type Trick = typeof tricksTable.$inferSelect;
export type NewTrick = typeof tricksTable.$inferInsert;
export type Weis = typeof weisTable.$inferSelect;
export type NewWeis = typeof weisTable.$inferInsert;
export type GameStatistics = typeof gameStatisticsTable.$inferSelect;
export type NewGameStatistics = typeof gameStatisticsTable.$inferInsert;
