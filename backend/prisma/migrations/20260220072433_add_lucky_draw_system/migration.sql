-- CreateEnum
CREATE TYPE "activity_status" AS ENUM ('SUCCESS', 'FAILURE', 'PENDING');

-- CreateEnum
CREATE TYPE "contest_status" AS ENUM ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "approval_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "draw_mode" AS ENUM ('RANDOM', 'MANUAL', 'WEIGHTED');

-- CreateEnum
CREATE TYPE "draw_type" AS ENUM ('DAILY', 'MONTHLY', 'MEGA');

-- CreateEnum
CREATE TYPE "prize_type" AS ENUM ('DAILY', 'MONTHLY', 'MEGA');

-- CreateEnum
CREATE TYPE "message_type" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH');

-- CreateEnum
CREATE TYPE "prize_status" AS ENUM ('PENDING', 'CLAIMED', 'SHIPPED');

-- CreateEnum
CREATE TYPE "role_type" AS ENUM ('ADMIN', 'SUPERADMIN', 'MODERATOR');

-- CreateTable
CREATE TABLE "admins" (
    "admin_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "role_type" NOT NULL DEFAULT 'ADMIN',
    "custom_role" VARCHAR(150),
    "permissions" JSONB,
    "two_factor" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(6),
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "supabase_user_id" UUID,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "admin_activity_log" (
    "log_id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "target_table" VARCHAR(100) NOT NULL,
    "target_id" INTEGER,
    "session_id" VARCHAR(255),
    "status" "activity_status" NOT NULL DEFAULT 'SUCCESS',
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_activity_log_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "contests" (
    "contest_id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "theme" VARCHAR(150),
    "description" TEXT,
    "entry_form_id" INTEGER,
    "start_date" TIMESTAMP(6),
    "start_time" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "mega_draw_date" TIMESTAMP(6),
    "entry_rules" JSONB,
    "status" "contest_status" DEFAULT 'DRAFT',
    "created_by" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qr_code_url" VARCHAR(500),
    "approval_status" "approval_status" NOT NULL DEFAULT 'PENDING',
    "trigger_word" VARCHAR(100),
    "scratch_card_enabled" BOOLEAN NOT NULL DEFAULT false,
    "scratch_card_block_size" INTEGER NOT NULL DEFAULT 10,
    "scratch_card_trigger_word" VARCHAR(100),
    "whatsapp_flow_id" VARCHAR(50),
    "brochure_url" TEXT,
    "instagram_url" TEXT,
    "redemption_deadline_mega" DATE,
    "redemption_deadline_store" DATE,
    "scratch_card_url" TEXT,
    "winning_probability" DECIMAL(3,2),
    "prerequisite_contest_id" INTEGER,
    "guaranteed_winner_mode" BOOLEAN DEFAULT false,
    "block_allocation_enabled" BOOLEAN DEFAULT false,
    "current_block_id" INTEGER DEFAULT 1,
    "prizes_per_block" JSONB DEFAULT '[]',
    "monthly_draw_enabled" BOOLEAN DEFAULT false,
    "monthly_draw_date" INTEGER DEFAULT 15,
    "monthly_draw_time" TIME,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("contest_id")
);

-- CreateTable
CREATE TABLE "prizes" (
    "prize_id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "prize_name" VARCHAR(150) NOT NULL,
    "prize_type" "prize_type" NOT NULL DEFAULT 'DAILY',
    "value" DECIMAL(12,2),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("prize_id")
);

-- CreateTable
CREATE TABLE "participants" (
    "participant_id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "form_response_id" INTEGER,
    "contact" VARCHAR(150) NOT NULL,
    "whatsapp_id" VARCHAR(50),
    "address" VARCHAR(500),
    "entry_timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validated" BOOLEAN NOT NULL DEFAULT true,
    "unique_token" VARCHAR(255),
    "daily_draw_eligible" BOOLEAN NOT NULL DEFAULT true,
    "mega_draw_eligible" BOOLEAN NOT NULL DEFAULT true,
    "monthly_draw_eligible" BOOLEAN NOT NULL DEFAULT true,
    "participation_month" DATE,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("participant_id")
);

-- CreateTable
CREATE TABLE "draws" (
    "draw_id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "draw_type" "draw_type" NOT NULL,
    "draw_mode" "draw_mode" NOT NULL DEFAULT 'RANDOM',
    "executed_by" INTEGER,
    "executed_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_winners" INTEGER NOT NULL,
    "participant_date_range" JSONB,

    CONSTRAINT "draws_pkey" PRIMARY KEY ("draw_id")
);

-- CreateTable
CREATE TABLE "winners" (
    "winner_id" SERIAL NOT NULL,
    "draw_id" INTEGER NOT NULL,
    "participant_id" INTEGER NOT NULL,
    "winner_name" TEXT,
    "prize_id" INTEGER,
    "draw_type" "draw_type",
    "prize_status" "prize_status" NOT NULL DEFAULT 'PENDING',
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notified_at" TIMESTAMP(6),
    "won_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "winners_pkey" PRIMARY KEY ("winner_id")
);

-- CreateTable
CREATE TABLE "monthly_draw_history" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "draw_month" DATE NOT NULL,
    "draw_date" DATE NOT NULL,
    "total_participants" INTEGER NOT NULL DEFAULT 0,
    "total_winners" INTEGER NOT NULL DEFAULT 0,
    "executed_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executed_by" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',

    CONSTRAINT "monthly_draw_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "message_id" SERIAL NOT NULL,
    "contest_id" INTEGER,
    "participant_id" INTEGER,
    "type" "message_type",
    "recipient" VARCHAR(150),
    "content" TEXT NOT NULL,
    "message_type" VARCHAR(50),
    "sent_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_by" INTEGER,
    "is_auto" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "forms" (
    "form_id" SERIAL NOT NULL,
    "form_name" VARCHAR(150) NOT NULL,
    "form_schema" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("form_id")
);

-- CreateTable
CREATE TABLE "form_responses" (
    "response_id" SERIAL NOT NULL,
    "form_id" INTEGER,
    "response_data" JSONB,
    "submitted_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "whatsapp_id" VARCHAR(50),
    "phone_number" VARCHAR(20),
    "user_name" VARCHAR(150),
    "user_category" VARCHAR(100),

    CONSTRAINT "form_responses_pkey" PRIMARY KEY ("response_id")
);

-- CreateTable
CREATE TABLE "scratch_card_prizes" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "prize_name" VARCHAR(150) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "win_positions" INTEGER[],
    "value" DECIMAL(12,2),
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_winners" INTEGER NOT NULL DEFAULT 0,
    "max_winners" INTEGER NOT NULL DEFAULT 100,
    "winning_probability" DECIMAL(5,2) NOT NULL DEFAULT 30.00,
    "quantity_per_block" INTEGER DEFAULT 0,
    "allocated_in_current_block" INTEGER DEFAULT 0,

    CONSTRAINT "scratch_card_prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scratch_participations" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "whatsapp_id" VARCHAR(50) NOT NULL,
    "user_name" VARCHAR(150) NOT NULL,
    "occupation" VARCHAR(150) NOT NULL,
    "location" VARCHAR(150) NOT NULL,
    "pincode" VARCHAR(10) NOT NULL,
    "scratch_card_url" TEXT NOT NULL,
    "participation_date" DATE NOT NULL,
    "result" VARCHAR(20),
    "scratched_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scratch_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mega_draw_entries" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "scratch_participation_id" INTEGER NOT NULL,
    "whatsapp_id" VARCHAR(50) NOT NULL,
    "user_name" VARCHAR(150) NOT NULL,
    "occupation" VARCHAR(150) NOT NULL,
    "location" VARCHAR(150) NOT NULL,
    "pincode" VARCHAR(10) NOT NULL,
    "entered_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trigger_word_used" VARCHAR(100),

    CONSTRAINT "mega_draw_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_allocation_audit" (
    "audit_id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "block_id" INTEGER NOT NULL,
    "block_size" INTEGER NOT NULL,
    "allocation_mode" VARCHAR(20) NOT NULL,
    "configured_prizes" JSONB NOT NULL,
    "total_cards_in_block" INTEGER NOT NULL DEFAULT 0,
    "allocated_cards" INTEGER NOT NULL DEFAULT 0,
    "remaining_cards" INTEGER NOT NULL DEFAULT 0,
    "allocated_prizes" JSONB NOT NULL DEFAULT '[]',
    "block_status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,

    CONSTRAINT "block_allocation_audit_pkey" PRIMARY KEY ("audit_id")
);

-- CreateTable
CREATE TABLE "card_allocation_audit" (
    "card_audit_id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "block_id" INTEGER NOT NULL,
    "card_position" INTEGER NOT NULL,
    "participation_id" INTEGER,
    "whatsapp_id" VARCHAR(20),
    "is_winner" BOOLEAN NOT NULL,
    "prize_id" INTEGER,
    "prize_name" VARCHAR(255),
    "allocation_algorithm" VARCHAR(50) NOT NULL,
    "allocation_timestamp" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "random_seed" VARCHAR(100),
    "allocated_by" INTEGER,

    CONSTRAINT "card_allocation_audit_pkey" PRIMARY KEY ("card_audit_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_supabase_user_id_key" ON "admins"("supabase_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "contests_trigger_word_key" ON "contests"("trigger_word");

-- CreateIndex
CREATE INDEX "contests_created_at_idx" ON "contests"("created_at");

-- CreateIndex
CREATE INDEX "contests_status_idx" ON "contests"("status");

-- CreateIndex
CREATE INDEX "contests_mega_draw_date_idx" ON "contests"("mega_draw_date");

-- CreateIndex
CREATE INDEX "contests_trigger_word_idx" ON "contests"("trigger_word");

-- CreateIndex
CREATE INDEX "contests_scratch_card_enabled_idx" ON "contests"("scratch_card_enabled");

-- CreateIndex
CREATE INDEX "contests_prerequisite_contest_id_idx" ON "contests"("prerequisite_contest_id");

-- CreateIndex
CREATE INDEX "idx_contests_block_allocation" ON "contests"("block_allocation_enabled");

-- CreateIndex
CREATE INDEX "prizes_contest_id_idx" ON "prizes"("contest_id");

-- CreateIndex
CREATE INDEX "prizes_prize_type_idx" ON "prizes"("prize_type");

-- CreateIndex
CREATE UNIQUE INDEX "participants_unique_token_key" ON "participants"("unique_token");

-- CreateIndex
CREATE INDEX "participants_contest_id_idx" ON "participants"("contest_id");

-- CreateIndex
CREATE INDEX "participants_contact_idx" ON "participants"("contact");

-- CreateIndex
CREATE INDEX "participants_whatsapp_id_idx" ON "participants"("whatsapp_id");

-- CreateIndex
CREATE INDEX "participants_unique_token_idx" ON "participants"("unique_token");

-- CreateIndex
CREATE INDEX "participants_daily_draw_eligible_idx" ON "participants"("daily_draw_eligible");

-- CreateIndex
CREATE INDEX "participants_mega_draw_eligible_idx" ON "participants"("mega_draw_eligible");

-- CreateIndex
CREATE INDEX "participants_monthly_draw_eligible_idx" ON "participants"("monthly_draw_eligible");

-- CreateIndex
CREATE INDEX "participants_participation_month_idx" ON "participants"("participation_month");

-- CreateIndex
CREATE INDEX "idx_participants_whatsapp" ON "participants"("whatsapp_id");

-- CreateIndex
CREATE INDEX "draws_contest_id_idx" ON "draws"("contest_id");

-- CreateIndex
CREATE INDEX "draws_draw_type_idx" ON "draws"("draw_type");

-- CreateIndex
CREATE INDEX "draws_executed_at_idx" ON "draws"("executed_at");

-- CreateIndex
CREATE INDEX "winners_draw_id_idx" ON "winners"("draw_id");

-- CreateIndex
CREATE INDEX "winners_participant_id_idx" ON "winners"("participant_id");

-- CreateIndex
CREATE INDEX "winners_draw_type_idx" ON "winners"("draw_type");

-- CreateIndex
CREATE INDEX "winners_won_at_idx" ON "winners"("won_at");

-- CreateIndex
CREATE INDEX "idx_winners_participant" ON "winners"("participant_id");

-- CreateIndex
CREATE INDEX "monthly_draw_history_contest_id_idx" ON "monthly_draw_history"("contest_id");

-- CreateIndex
CREATE INDEX "monthly_draw_history_draw_month_idx" ON "monthly_draw_history"("draw_month");

-- CreateIndex
CREATE INDEX "monthly_draw_history_draw_date_idx" ON "monthly_draw_history"("draw_date");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_draw_history_contest_id_draw_month_key" ON "monthly_draw_history"("contest_id", "draw_month");

-- CreateIndex
CREATE INDEX "messages_participant_id_idx" ON "messages"("participant_id");

-- CreateIndex
CREATE INDEX "messages_sent_at_idx" ON "messages"("sent_at");

-- CreateIndex
CREATE INDEX "messages_contest_id_idx" ON "messages"("contest_id");

-- CreateIndex
CREATE INDEX "form_responses_whatsapp_id_idx" ON "form_responses"("whatsapp_id");

-- CreateIndex
CREATE INDEX "form_responses_phone_number_idx" ON "form_responses"("phone_number");

-- CreateIndex
CREATE INDEX "form_responses_submitted_at_idx" ON "form_responses"("submitted_at");

-- CreateIndex
CREATE INDEX "scratch_card_prizes_contest_id_idx" ON "scratch_card_prizes"("contest_id");

-- CreateIndex
CREATE INDEX "scratch_card_prizes_winning_probability_idx" ON "scratch_card_prizes"("winning_probability");

-- CreateIndex
CREATE INDEX "scratch_card_prizes_current_winners_max_winners_idx" ON "scratch_card_prizes"("current_winners", "max_winners");

-- CreateIndex
CREATE INDEX "idx_scratch_prizes_block_quantity" ON "scratch_card_prizes"("quantity_per_block");

-- CreateIndex
CREATE INDEX "scratch_participations_contest_id_idx" ON "scratch_participations"("contest_id");

-- CreateIndex
CREATE INDEX "scratch_participations_whatsapp_id_idx" ON "scratch_participations"("whatsapp_id");

-- CreateIndex
CREATE INDEX "scratch_participations_result_idx" ON "scratch_participations"("result");

-- CreateIndex
CREATE INDEX "scratch_participations_participation_date_idx" ON "scratch_participations"("participation_date");

-- CreateIndex
CREATE INDEX "idx_scratch_participations_whatsapp" ON "scratch_participations"("whatsapp_id");

-- CreateIndex
CREATE UNIQUE INDEX "scratch_participations_contest_id_whatsapp_id_participation_key" ON "scratch_participations"("contest_id", "whatsapp_id", "participation_date");

-- CreateIndex
CREATE INDEX "mega_draw_entries_contest_id_idx" ON "mega_draw_entries"("contest_id");

-- CreateIndex
CREATE INDEX "mega_draw_entries_whatsapp_id_idx" ON "mega_draw_entries"("whatsapp_id");

-- CreateIndex
CREATE INDEX "mega_draw_entries_scratch_participation_id_idx" ON "mega_draw_entries"("scratch_participation_id");

-- CreateIndex
CREATE INDEX "idx_mega_draw_entries_scratch_participation" ON "mega_draw_entries"("scratch_participation_id");

-- CreateIndex
CREATE INDEX "idx_mega_draw_entries_trigger_word" ON "mega_draw_entries"("trigger_word_used");

-- CreateIndex
CREATE INDEX "idx_mega_draw_entries_whatsapp" ON "mega_draw_entries"("whatsapp_id");

-- CreateIndex
CREATE UNIQUE INDEX "mega_draw_entries_contest_id_whatsapp_id_key" ON "mega_draw_entries"("contest_id", "whatsapp_id");

-- CreateIndex
CREATE INDEX "idx_block_allocation_contest_block" ON "block_allocation_audit"("contest_id", "block_id");

-- CreateIndex
CREATE INDEX "idx_block_allocation_status" ON "block_allocation_audit"("block_status");

-- CreateIndex
CREATE UNIQUE INDEX "block_allocation_audit_contest_id_block_id_key" ON "block_allocation_audit"("contest_id", "block_id");

-- CreateIndex
CREATE INDEX "idx_card_allocation_contest_block" ON "card_allocation_audit"("contest_id", "block_id");

-- CreateIndex
CREATE INDEX "idx_card_allocation_participant" ON "card_allocation_audit"("participation_id");

-- CreateIndex
CREATE INDEX "idx_card_allocation_position" ON "card_allocation_audit"("contest_id", "block_id", "card_position");

-- CreateIndex
CREATE UNIQUE INDEX "card_allocation_audit_contest_id_block_id_card_position_key" ON "card_allocation_audit"("contest_id", "block_id", "card_position");

-- AddForeignKey
ALTER TABLE "admin_activity_log" ADD CONSTRAINT "admin_activity_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("admin_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests" ADD CONSTRAINT "contests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("admin_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests" ADD CONSTRAINT "contests_entry_form_id_fkey" FOREIGN KEY ("entry_form_id") REFERENCES "forms"("form_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests" ADD CONSTRAINT "contests_prerequisite_contest_id_fkey" FOREIGN KEY ("prerequisite_contest_id") REFERENCES "contests"("contest_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prizes" ADD CONSTRAINT "prizes_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("contest_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("contest_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_form_response_id_fkey" FOREIGN KEY ("form_response_id") REFERENCES "form_responses"("response_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draws" ADD CONSTRAINT "draws_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("contest_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draws" ADD CONSTRAINT "draws_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "admins"("admin_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_draw_id_fkey" FOREIGN KEY ("draw_id") REFERENCES "draws"("draw_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("participant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_prize_id_fkey" FOREIGN KEY ("prize_id") REFERENCES "prizes"("prize_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_draw_history" ADD CONSTRAINT "monthly_draw_history_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("contest_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_draw_history" ADD CONSTRAINT "monthly_draw_history_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "admins"("admin_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("contest_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("participant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "admins"("admin_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("form_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scratch_card_prizes" ADD CONSTRAINT "scratch_card_prizes_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("contest_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scratch_participations" ADD CONSTRAINT "scratch_participations_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("contest_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mega_draw_entries" ADD CONSTRAINT "mega_draw_entries_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("contest_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mega_draw_entries" ADD CONSTRAINT "mega_draw_entries_scratch_participation_id_fkey" FOREIGN KEY ("scratch_participation_id") REFERENCES "scratch_participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_allocation_audit" ADD CONSTRAINT "block_allocation_audit_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("contest_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "block_allocation_audit" ADD CONSTRAINT "block_allocation_audit_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("admin_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "card_allocation_audit" ADD CONSTRAINT "card_allocation_audit_allocated_by_fkey" FOREIGN KEY ("allocated_by") REFERENCES "admins"("admin_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "card_allocation_audit" ADD CONSTRAINT "card_allocation_audit_contest_id_block_id_fkey" FOREIGN KEY ("contest_id", "block_id") REFERENCES "block_allocation_audit"("contest_id", "block_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "card_allocation_audit" ADD CONSTRAINT "card_allocation_audit_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("contest_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "card_allocation_audit" ADD CONSTRAINT "card_allocation_audit_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "scratch_participations"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "card_allocation_audit" ADD CONSTRAINT "card_allocation_audit_prize_id_fkey" FOREIGN KEY ("prize_id") REFERENCES "scratch_card_prizes"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
