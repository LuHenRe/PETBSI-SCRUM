CREATE TABLE "work_item_state_change" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text DEFAULT 'petbsi' NOT NULL,
	"itemId" text NOT NULL,
	"fromStatus" text,
	"toStatus" text NOT NULL,
	"changedBy" text NOT NULL,
	"reason" text,
	"changedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_column" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text DEFAULT 'petbsi' NOT NULL,
	"status" text NOT NULL,
	"name" text NOT NULL,
	"wipLimit" integer,
	"orderIndex" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "backlog_item" ADD COLUMN "orderIndex" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "work_item_state_change" ADD CONSTRAINT "work_item_state_change_itemId_backlog_item_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."backlog_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_item_state_change" ADD CONSTRAINT "work_item_state_change_changedBy_user_id_fk" FOREIGN KEY ("changedBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_project_status_unique" ON "workflow_column" USING btree ("projectId","status");