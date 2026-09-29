CREATE TABLE "delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text DEFAULT 'petbsi' NOT NULL,
	"frontId" text NOT NULL,
	"sprintId" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'planejada' NOT NULL,
	"completedOn" text,
	CONSTRAINT "delivery_valid_status" CHECK ("delivery"."status" in ('planejada', 'em_andamento', 'entregue'))
);
--> statement-breakpoint
CREATE TABLE "delivery_item" (
	"deliveryId" text NOT NULL,
	"itemId" text NOT NULL,
	CONSTRAINT "delivery_item_deliveryId_itemId_pk" PRIMARY KEY("deliveryId","itemId")
);
--> statement-breakpoint
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_frontId_front_id_fk" FOREIGN KEY ("frontId") REFERENCES "public"."front"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_sprintId_sprint_id_fk" FOREIGN KEY ("sprintId") REFERENCES "public"."sprint"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_item" ADD CONSTRAINT "delivery_item_deliveryId_delivery_id_fk" FOREIGN KEY ("deliveryId") REFERENCES "public"."delivery"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_item" ADD CONSTRAINT "delivery_item_itemId_backlog_item_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."backlog_item"("id") ON DELETE no action ON UPDATE no action;