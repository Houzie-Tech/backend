import {
  PrismaClient,
  LeadStatus,
  PropertyType,
  Priority,
  LeadSource,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const brokerId = 'b6bd7404-f32a-4510-b7f5-13735938348f';

async function main() {
  // Create leads for each status type and associate them with listings
  const listingIds = [
    '28cd8ad4-2134-48f6-8769-1a542c7fac7f',
    '34fde82a-240a-4587-b329-6ef53edac66d',
    '4d15d785-cb5c-4762-9ee4-714b6bf392bf',
    '4f9f4d6f-afd6-400a-952b-e62e0fcccb27',
    '795ef7ef-299e-420f-b40b-605029d8af86',
    '86fef94d-3d59-4257-8c01-e0dfc88a3ec1',
    'af0c2d3b-e799-4638-97bc-6832bbf287ac',
    'b687a0d4-dfd2-4930-b806-8a79b5d2ea29',
    'ba875fe0-c6e3-4dc5-9444-fdaa2dc104f6',
    'db14bec6-f29e-4693-86bf-6c0b88e1efbd',
    'f3812dc5-2418-4db2-8f05-14cf851cb9fb',
  ];

  for (const listingId of listingIds) {
    await Promise.all(
      Array.from({ length: 10 }).map(async () => {
        return prisma.lead.create({
          data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phoneNumber: faker.phone.number(),
            isActive: false,
            budgetMin: parseInt(
              faker.finance.amount({ min: 100, max: 100000 }),
            ),
            budgetMax: parseFloat(
              faker.finance.amount({ min: 100, max: 1000000 }),
            ),
            preferredLocations: [faker.location.city(), faker.location.city()],
            propertyTypes: faker.helpers.arrayElements(
              Object.values(PropertyType),
              { min: 1, max: 3 },
            ),
            requirements: faker.lorem.sentence(),
            status: faker.helpers.arrayElement(Object.values(LeadStatus)),
            priority: faker.helpers.arrayElement(Object.values(Priority)),
            source: faker.helpers.arrayElement(Object.values(LeadSource)),
            broker: {
              connect: {
                id: brokerId,
              },
            },
            listing: { connect: { id: listingId } },
          },
        });
      }),
    );
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
