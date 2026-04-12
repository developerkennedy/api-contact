ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
DROP INDEX "categories_user_id_name_idx";--> statement-breakpoint
DROP INDEX "contacts_user_id_email_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_id_name_idx" ON "categories" USING btree ("user_id","name") WHERE "categories"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_user_id_email_idx" ON "contacts" USING btree ("user_id","email") WHERE "contacts"."deleted_at" is null;