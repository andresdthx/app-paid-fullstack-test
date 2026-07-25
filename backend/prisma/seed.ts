import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: 'Wireless Headphones Pro',
      description: 'Premium noise-cancelling wireless headphones with 30-hour battery life, Hi-Res audio support, and comfortable over-ear design.',
      price: 249900.00,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    },
    {
      name: 'Smart Watch Ultra',
      description: 'Advanced fitness tracker with GPS, heart rate monitor, sleep tracking, and 7-day battery. Water resistant to 50m.',
      price: 399900.00,
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    },
    {
      name: 'Portable Bluetooth Speaker',
      description: 'Compact waterproof speaker with 360-degree sound, 12-hour playtime, and built-in microphone for calls.',
      price: 129900.00,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    },
    {
      name: 'USB-C Hub Adapter',
      description: 'Multi-port adapter with HDMI 4K, USB 3.0, SD card reader, and 100W power delivery pass-through.',
      price: 89900.00,
      stock: 0,
      imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: product,
    });
  }

  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
