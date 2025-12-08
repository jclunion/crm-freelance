-- AlterTable
ALTER TABLE "users" ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "opportuniteId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "typeDocument" TEXT NOT NULL,
    "fichierUrl" TEXT NOT NULL,
    "tailleFichier" INTEGER,
    "mimeType" TEXT,
    "visiblePortail" BOOLEAN NOT NULL DEFAULT true,
    "proprietaireId" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateMiseAJour" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "opportunites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
