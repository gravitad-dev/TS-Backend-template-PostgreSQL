-- CreateTable
CREATE TABLE "Suggested" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Suggested_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArticlesSuggested" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductsSuggested" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Suggested_userId_key" ON "Suggested"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_ArticlesSuggested_AB_unique" ON "_ArticlesSuggested"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticlesSuggested_B_index" ON "_ArticlesSuggested"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductsSuggested_AB_unique" ON "_ProductsSuggested"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductsSuggested_B_index" ON "_ProductsSuggested"("B");

-- AddForeignKey
ALTER TABLE "Suggested" ADD CONSTRAINT "Suggested_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticlesSuggested" ADD CONSTRAINT "_ArticlesSuggested_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticlesSuggested" ADD CONSTRAINT "_ArticlesSuggested_B_fkey" FOREIGN KEY ("B") REFERENCES "Suggested"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsSuggested" ADD CONSTRAINT "_ProductsSuggested_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsSuggested" ADD CONSTRAINT "_ProductsSuggested_B_fkey" FOREIGN KEY ("B") REFERENCES "Suggested"("id") ON DELETE CASCADE ON UPDATE CASCADE;
