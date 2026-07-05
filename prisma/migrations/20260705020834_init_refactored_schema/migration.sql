/*
  Warnings:

  - You are about to drop the column `courses_Id` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `data_created` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `students_Id` on the `educational_guidances` table. All the data in the column will be lost.
  - You are about to drop the column `users_Id` on the `educational_guidances` table. All the data in the column will be lost.
  - You are about to drop the column `students_Id` on the `occurrences` table. All the data in the column will be lost.
  - You are about to drop the column `users_Id` on the `occurrences` table. All the data in the column will be lost.
  - You are about to drop the column `students_Id` on the `responsibles` table. All the data in the column will be lost.
  - You are about to drop the column `class_Id` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `data_created` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registration]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `course_id` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occurrence_id` to the `educational_guidances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `educational_guidances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `educational_guidances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `measuresTaken` to the `occurrences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `occurrences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `occurrences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `responsibles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `class_id` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDENTE', 'ATIVO', 'RECUSADO');

-- CreateEnum
CREATE TYPE "OccurrenceStatus" AS ENUM ('Aberta', 'Em Acompanhamento', 'Concluída');

-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_courses_Id_fkey";

-- DropForeignKey
ALTER TABLE "educational_guidances" DROP CONSTRAINT "educational_guidances_students_Id_fkey";

-- DropForeignKey
ALTER TABLE "educational_guidances" DROP CONSTRAINT "educational_guidances_users_Id_fkey";

-- DropForeignKey
ALTER TABLE "occurrences" DROP CONSTRAINT "occurrences_students_Id_fkey";

-- DropForeignKey
ALTER TABLE "occurrences" DROP CONSTRAINT "occurrences_users_Id_fkey";

-- DropForeignKey
ALTER TABLE "responsibles" DROP CONSTRAINT "responsibles_students_Id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_class_Id_fkey";

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "courses_Id",
ADD COLUMN     "course_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "data_created";

-- AlterTable
ALTER TABLE "educational_guidances" DROP COLUMN "students_Id",
DROP COLUMN "users_Id",
ADD COLUMN     "occurrence_id" INTEGER NOT NULL,
ADD COLUMN     "student_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "occurrences" DROP COLUMN "students_Id",
DROP COLUMN "users_Id",
ADD COLUMN     "acknowledged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acknowledgedBy" TEXT,
ADD COLUMN     "acknowledged_at" TIMESTAMP(3),
ADD COLUMN     "measuresTaken" TEXT NOT NULL,
ADD COLUMN     "status" "OccurrenceStatus" NOT NULL DEFAULT 'Aberta',
ADD COLUMN     "student_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "responsibles" DROP COLUMN "students_Id",
ADD COLUMN     "student_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "class_Id",
ADD COLUMN     "class_id" INTEGER NOT NULL,
ADD COLUMN     "registration" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "data_created",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDENTE';

-- CreateIndex
CREATE UNIQUE INDEX "students_registration_key" ON "students"("registration");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsibles" ADD CONSTRAINT "responsibles_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educational_guidances" ADD CONSTRAINT "educational_guidances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educational_guidances" ADD CONSTRAINT "educational_guidances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educational_guidances" ADD CONSTRAINT "educational_guidances_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "occurrences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
