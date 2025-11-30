-- CreateTable
CREATE TABLE "StoryAttachment" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StoryAttachment" ADD CONSTRAINT "StoryAttachment_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "UserStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
