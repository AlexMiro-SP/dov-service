-- DropForeignKey
ALTER TABLE "paragraph" DROP CONSTRAINT "paragraph_sub_snippet_id_fkey";

-- DropForeignKey
ALTER TABLE "variation" DROP CONSTRAINT "variation_paragraph_id_fkey";

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_sub_snippet_id_fkey" FOREIGN KEY ("sub_snippet_id") REFERENCES "sub_snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variation" ADD CONSTRAINT "variation_paragraph_id_fkey" FOREIGN KEY ("paragraph_id") REFERENCES "paragraph"("id") ON DELETE CASCADE ON UPDATE CASCADE;
