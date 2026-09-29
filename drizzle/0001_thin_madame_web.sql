ALTER TABLE "project_membership" ALTER COLUMN "frontPermissions" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "backlog_item" ADD COLUMN "projectId" text DEFAULT 'petbsi' NOT NULL;--> statement-breakpoint
ALTER TABLE "front" ADD COLUMN "projectId" text DEFAULT 'petbsi' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_membership" ADD COLUMN "projectId" text DEFAULT 'petbsi' NOT NULL;--> statement-breakpoint
ALTER TABLE "sprint" ADD COLUMN "projectId" text DEFAULT 'petbsi' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "googleSubject" text;--> statement-breakpoint
CREATE UNIQUE INDEX "membership_project_user_unique" ON "project_membership" USING btree ("projectId","userId");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_googleSubject_unique" UNIQUE("googleSubject");