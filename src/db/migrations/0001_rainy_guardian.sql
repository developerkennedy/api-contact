ALTER TABLE "contacts" DROP CONSTRAINT "contacts_email_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_user_id_email_idx" ON "contacts" USING btree ("user_id","email");