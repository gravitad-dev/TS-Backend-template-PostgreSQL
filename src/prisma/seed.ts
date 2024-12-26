import bcrypt from 'bcryptjs';
import { PrismaClient, Status_Product, Status_Article, Status_Order, Payment_Order } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categoryData = ['Electronics', 'Books', 'Apparel', 'Home & Garden', 'Sports & Outdoors'];
  const categories = await Promise.all(
    categoryData.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  console.log('Categories created or updated');

  // Create users
  const hashedPassword = await bcrypt.hash('Password123', 10);
  const userData = [
    { email: 'user1@example.com', username: 'user1', name: 'User One', image: 'user1.jpg', role: 'USER' },
    { email: 'user2@example.com', username: 'user2', name: 'User Two', image: 'user2.jpg', role: 'USER' },
    { email: 'admin@example.com', username: 'admin', name: 'Admin User', image: 'admin.jpg', role: 'ADMIN' },
    {
      email: 'superadmin@example.com',
      username: 'superadmin',
      name: 'SuperAdmin User',
      image: 'superadmin.jpg',
      role: 'SUPERADMIN',
    },
  ];

  const users = await Promise.all(
    userData.map((user: any) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          ...user,
          password: hashedPassword,
        },
      })
    )
  );

  console.log('Users created or updated');

  // Create products
  const productData = [
    {
      id: 1001,
      name: 'Smartphone',
      image: 'smartphone.jpg',
      imageGallery: ['smartphone1.jpg', 'smartphone2.jpg'],
      regularPrice: 599.99,
      offerPrice: 499.99,
      status: Status_Product.ACTIVE,
      categoryId: categories[0].id,
      stock: 100,
      attributes: { color: 'Black', storage: '128GB' },
      content:
        '<h2>Smartphone Features</h2><ul><li>High-resolution display</li><li>128GB Storage</li><li>Advanced camera system</li></ul>',
    },
    {
      id: 1002,
      name: 'Programming Book',
      image: 'book.jpg',
      imageGallery: ['book1.jpg', 'book2.jpg'],
      regularPrice: 49.99,
      status: Status_Product.ACTIVE,
      categoryId: categories[1].id,
      stock: 50,
      attributes: { format: 'Hardcover', pages: 500 },
      content: '<h2>About This Book</h2><p>A comprehensive guide to modern programming techniques.</p>',
      productType: 'PHYSICAL',
    },
    {
      id: 1003,
      name: 'Running Shoes',
      image: 'shoes.jpg',
      imageGallery: ['shoes1.jpg', 'shoes2.jpg'],
      regularPrice: 89.99,
      offerPrice: 79.99,
      status: Status_Product.ACTIVE,
      categoryId: categories[4].id,
      stock: 200,
      attributes: { size: '9', color: 'Blue' },
      content:
        '<h2>Running Shoe Features</h2><ul><li>Lightweight design</li><li>Superior cushioning</li><li>Breathable material</li></ul>',
    },
    {
      id: 1004,
      name: 'Garden Tools Set',
      image: 'gardentools.jpg',
      imageGallery: ['gardentools1.jpg', 'gardentools2.jpg'],
      regularPrice: 79.99,
      status: Status_Product.ACTIVE,
      categoryId: categories[3].id,
      stock: 30,
      attributes: { pieces: '5', material: 'Stainless Steel' },
      content: '<h2>Garden Tools Set</h2><p>A complete set of essential tools for your gardening needs.</p>',
    },
    {
      id: 1005,
      name: 'T-Shirt',
      image: 'tshirt.jpg',
      imageGallery: ['tshirt1.jpg', 'tshirt2.jpg'],
      regularPrice: 19.99,
      offerPrice: 14.99,
      status: Status_Product.ACTIVE,
      categoryId: categories[2].id,
      stock: 500,
      attributes: { size: 'M', color: 'White' },
      content: '<h2>T-Shirt Details</h2><p>Comfortable, 100% cotton t-shirt suitable for everyday wear.</p>',
    },
  ];

  const products = await Promise.all(
    productData.map((product: any) =>
      prisma.product.upsert({
        where: { id: product.id },
        update: {},
        create: product,
      })
    )
  );

  console.log('Products created or updated');

  // Create articles
  const articleData = [
    {
      title: 'The Future of Technology',
      summary: 'Exploring upcoming tech trends',
      coverImage: 'tech-future.jpg',
      status: Status_Article.PUBLISHED,
      url: 'future-of-technology',
      authorId: users[3].id, // superadmin
      categoryId: categories[0].id,
      content:
        '<h1>The Future of Technology</h1><p>In this article, we explore the advancements in technology that are expected to shape the future.</p>',
    },
    {
      title: 'Top 10 Books for Programmers',
      summary: 'A list of must-read books for programmers',
      coverImage: 'book-review.jpg',
      status: Status_Article.PUBLISHED,
      url: 'top-10-books-for-programmers',
      authorId: users[0].id, // user1
      categoryId: categories[1].id,
      content:
        '<h1>Top 10 Books for Programmers</h1><p>Discover some of the most essential reads for those in the programming industry.</p>',
    },
    {
      title: 'Sustainable Gardening Practices',
      summary: 'Tips for eco-friendly gardening',
      coverImage: 'eco-garden.jpg',
      status: Status_Article.PUBLISHED,
      url: 'sustainable-gardening-practices',
      authorId: users[1].id, // user2
      categoryId: categories[3].id,
      content:
        '<h1>Sustainable Gardening Practices</h1><p>Learn how to create and maintain an environmentally friendly garden.</p>',
    },
    {
      title: 'Fashion Trends for the Season',
      summary: "What's hot in fashion this season",
      coverImage: 'fashion-trends.jpg',
      status: Status_Article.DRAFT,
      url: 'fashion-trends-season',
      authorId: users[2].id, // admin
      categoryId: categories[2].id,
      content:
        '<h1>Fashion Trends for the Season</h1><p>Explore the latest styles and trends dominating the fashion world this season.</p>',
    },
  ];

  await Promise.all(
    articleData.map((article) =>
      prisma.article.upsert({
        where: { url: article.url },
        update: {},
        create: article,
      })
    )
  );

  console.log('Articles created or updated');

  // Create or update carts for users
  await Promise.all(
    users.slice(0, 2).map((user, index) =>
      prisma.cart.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          products: {
            create: [
              { productId: products[index].id, quantity: 1 },
              { productId: products[(index + 1) % products.length].id, quantity: 2 },
            ],
          },
        },
      })
    )
  );

  console.log('Carts created or updated');

  // Create or update buyers
  const buyerData = [
    {
      id: 1001,
      name: 'John Doe',
      email: 'john@example.com',
      addressBuyer: '123 Main St, City, Country',
      phoneNumber: '+1234567890',
    },
    {
      id: 1002,
      name: 'Jane Smith',
      email: 'jane@example.com',
      addressBuyer: '456 Elm St, Town, Country',
      phoneNumber: '+0987654321',
    },
    {
      id: 1003,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      addressBuyer: '789 Oak St, Village, Country',
      phoneNumber: '+1122334455',
    },
  ];

  const buyers = await Promise.all(
    buyerData.map((buyer: any) =>
      prisma.buyer.upsert({
        where: { id: buyer.id },
        update: {},
        create: buyer,
      })
    )
  );

  console.log('Buyers created or updated');

  // Create orders and payments
  for (let i = 0; i < 5; i++) {
    const order = await prisma.order.create({
      data: {
        userId: users[i % users.length].id,
        buyerId: buyers[i % buyers.length].id,
        status: ['PENDING', 'COMPLETED', 'CANCELLED'][Math.floor(Math.random() * 3)] as Status_Order,
        totalAmount: Math.random() * 1000 + 100,
        paymentType: ['CREDIT_CARD', 'DEBIT_CARD', 'CRYPTO'][Math.floor(Math.random() * 3)] as Payment_Order,
        addressOrder: buyers[i % buyers.length].addressBuyer,
        orderProducts: {
          create: [
            { productId: products[i % products.length].id, quantity: Math.floor(Math.random() * 3) + 1 },
            { productId: products[(i + 1) % products.length].id, quantity: Math.floor(Math.random() * 3) + 1 },
          ],
        },
      },
    });

    await prisma.payment.create({
      data: {
        stripeId: 'pi_' + Math.random().toString(36).substr(2, 9),
        amount: order.totalAmount,
        currency: 'USD',
        userId: order.userId,
        orderId: order.id,
        status: ['succeeded', 'pending', 'failed'][Math.floor(Math.random() * 3)],
      },
    });
  }

  console.log('Orders and Payments created');
  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
