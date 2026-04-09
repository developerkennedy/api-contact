import { index, pgTable, timestamp, uuid, varchar, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const timestamps = {
  updated_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp(),
};

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  ...timestamps,
});

export const contactsTable = pgTable("contacts", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  user_id: uuid().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  ...timestamps,
}, (t) => [
  index('contacts_user_id_idx').on(t.user_id),
]);

export const categoriesTable = pgTable("categories", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  ...timestamps,
});

export const contactsCategoriesTable = pgTable("contacts_categories", {
  contact_id: uuid().notNull().references(() => contactsTable.id, { onDelete: "cascade" }),
  category_id: uuid().notNull().references(() => categoriesTable.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.contact_id, t.category_id] }),
]);

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  contacts: many(contactsTable),
}));

export const contactsRelations = relations(contactsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [contactsTable.user_id],
    references: [usersTable.id],
  }),
  categories: many(contactsCategoriesTable),
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  contacts: many(contactsCategoriesTable),
}));

export const contactsCategoriesRelations = relations(contactsCategoriesTable, ({ one }) => ({
  contact: one(contactsTable, {
    fields: [contactsCategoriesTable.contact_id],
    references: [contactsTable.id],
  }),
  category: one(categoriesTable, {
    fields: [contactsCategoriesTable.category_id],
    references: [categoriesTable.id],
  }),
}));
