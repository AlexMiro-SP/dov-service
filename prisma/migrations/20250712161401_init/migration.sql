-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'USER');

-- CreateEnum
CREATE TYPE "VariationType" AS ENUM ('SLIM', 'EVERGREEN', 'DYNAMIC');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snippet" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "snippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_snippet" (
    "id" TEXT NOT NULL,
    "snippet_id" TEXT NOT NULL,
    "variation_type" "VariationType" NOT NULL,
    "base" TEXT NOT NULL,
    "order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_snippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paragraph" (
    "id" TEXT NOT NULL,
    "sub_snippet_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER,

    CONSTRAINT "paragraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variation" (
    "id" TEXT NOT NULL,
    "paragraph_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "variation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_type" (
    "id" SERIAL NOT NULL,
    "external_id" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "category_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_parameter" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ui_code" TEXT NOT NULL,
    "label" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_parameter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "category_type_external_id_key" ON "category_type"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_parameter_code_key" ON "template_parameter"("code");

-- AddForeignKey
ALTER TABLE "sub_snippet" ADD CONSTRAINT "sub_snippet_snippet_id_fkey" FOREIGN KEY ("snippet_id") REFERENCES "snippet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_sub_snippet_id_fkey" FOREIGN KEY ("sub_snippet_id") REFERENCES "sub_snippet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variation" ADD CONSTRAINT "variation_paragraph_id_fkey" FOREIGN KEY ("paragraph_id") REFERENCES "paragraph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
