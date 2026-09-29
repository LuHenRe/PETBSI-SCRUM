CREATE TABLE "calendar_event" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text DEFAULT 'petbsi' NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"kind" text NOT NULL,
	"sourceItemId" text,
	"syncStatus" text DEFAULT 'local' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_event" ADD CONSTRAINT "calendar_event_sourceItemId_backlog_item_id_fk" FOREIGN KEY ("sourceItemId") REFERENCES "public"."backlog_item"("id") ON DELETE no action ON UPDATE no action;