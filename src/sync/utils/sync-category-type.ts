import { PrismaClient } from '@prisma/client';

export async function upsertCategoryType(
  prisma: PrismaClient,
  externalItem: { id: number; code: string; name: string; slug: string },
) {
  const existing = await prisma.categoryType.findUnique({
    where: { externalId: externalItem.id },
  });

  if (existing) {
    const needsUpdate =
      existing.code !== externalItem.code ||
      existing.name !== externalItem.name ||
      existing.slug !== externalItem.slug;

    if (needsUpdate) {
      await prisma.categoryType.update({
        where: { externalId: externalItem.id },
        data: {
          code: externalItem.code,
          name: externalItem.name,
          slug: externalItem.slug,
        },
      });
    }
  } else {
    await prisma.categoryType.create({
      data: {
        externalId: externalItem.id,
        code: externalItem.code,
        name: externalItem.name,
        slug: externalItem.slug,
      },
    });
  }
}
