// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing stations
  await prisma.metroStation.deleteMany({
    where: {
      city: 'Gurgaon',
    },
  });

  // Seed Gurgaon metro stations
  const gurgaonMetroStations = [
    {
      name: 'HUDA City Centre',
      line: 'Yellow Line',
      latitude: 28.4594,
      longitude: 77.0266,
      city: 'Gurgaon',
    },
    {
      name: 'IFFCO Chowk',
      line: 'Yellow Line',
      latitude: 28.4722,
      longitude: 77.0723,
      city: 'Gurgaon',
    },
    {
      name: 'MG Road',
      line: 'Yellow Line',
      latitude: 28.4795,
      longitude: 77.0876,
      city: 'Gurgaon',
    },
    // Add more Gurgaon metro stations as needed
  ];

  for (const station of gurgaonMetroStations) {
    await prisma.metroStation.create({
      data: station,
    });
  }

  console.log('Seeded Gurgaon metro stations successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
