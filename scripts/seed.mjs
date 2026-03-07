import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
    {
        name: 'Green Croc-Embedded SnP',
        price: 300,
        image_url: '/images/SnPimage.png',
        images: ['/images/SnPimage.png', '/images/SnPimage2.png'],
        description: 'Comfortable and stylish slippers with croc-embedded design. Perfect for indoor and outdoor use.',
        category: 'slippers',
        subcategory: 'casual',
        rating: 5.0,
        reviews: 24,
        in_stock: true,
        is_new: true,
        sizes: ['37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
        tags: ['comfort', 'style', 'casual']
    },
    {
        name: 'Brown Croc-embossed Leather Slippers',
        price: 350,
        image_url: '/images/BrownCroc.jpg',
        images: ['/images/BrownCroc.jpg'],
        description: 'Premium leather slippers with croc-embossed pattern. Durable and comfortable for daily wear.',
        category: 'slippers',
        subcategory: 'leather',
        rating: 5.0,
        reviews: 18,
        in_stock: true,
        sizes: ['37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
        tags: ['leather', 'premium', 'durable']
    },
    {
        name: 'Black Leather Slippers',
        price: 180,
        original_price: 200,
        image_url: '/images/BlackLeather1.jpeg',
        images: ['/images/BlackLeather1.jpeg', '/images/BlackLeather.jpg'],
        description: 'High-quality black leather slippers with premium materials and elegant design.',
        category: 'slippers',
        subcategory: 'leather',
        rating: 5.0,
        reviews: 32,
        in_stock: true,
        is_on_sale: true,
        discount: 10,
        sizes: ['37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
        tags: ['premium', 'comfort', 'durable']
    },
    {
        name: 'Black suede Slippers',
        price: 160.00,
        image_url: '/images/BlackSuede.jpg',
        images: ['/images/BlackSuede1.jpeg', '/images/BlackSuede.jpg'],
        description: 'Ultra-comfortable slippers for home use with memory foam insole.',
        category: 'slippers',
        subcategory: 'comfort',
        rating: 4.8,
        reviews: 28,
        in_stock: true,
        sizes: ['37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
        tags: ['comfort', 'home', 'soft']
    },
    {
        name: 'Cream Weave',
        price: 200.00,
        original_price: 200.00,
        image_url: '/images/CreamWeave.jpg',
        images: ['/images/CreamWeave.jpg', '/images/CreamWeave2.jpg', '/images/CreamWeave3.jpg'],
        description: 'Premium luxury slippers with elegant design and superior craftsmanship.',
        category: 'slippers',
        subcategory: 'luxury',
        rating: 4.9,
        reviews: 35,
        in_stock: true,
        is_on_sale: true,
        discount: 14,
        sizes: ['37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
        tags: ['luxury', 'elegant', 'premium']
    },
    {
        name: 'Brown weave',
        price: 200.00,
        image_url: '/images/BrownWeave.jpeg',
        images: ['/images/BrownWeave.jpeg'],
        description: 'Warm and cozy fuzzy slippers perfect for cold winter days.',
        category: 'slippers',
        subcategory: 'winter',
        rating: 4.7,
        reviews: 22,
        in_stock: true,
        sizes: ['37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
        tags: ['warm', 'fuzzy', 'winter']
    },
    {
        name: 'Brown Leather',
        price: 200.00,
        image_url: '/images/BrownLeather1.png',
        images: ['/images/BrownLeather1.png', '/images/BrownLeather2.jpeg'],
        description: 'Athletic-style slippers with breathable material and non-slip sole.',
        category: 'slippers',
        subcategory: 'sport',
        rating: 4.6,
        reviews: 16,
        in_stock: true,
        sizes: ['37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
        tags: ['sport', 'breathable', 'athletic']
    },
    {
        name: 'Blue Jean Slippers',
        price: 200,
        image_url: '/images/BlueJean.png',
        images: ['/images/BlueJean.png', '/images/BlueJean2.png'],
        description: 'Casual Jean Slippers to match your denim.',
        category: 'slippers',
        subcategory: 'classic',
        rating: 4.8,
        reviews: 31,
        in_stock: true,
        sizes: ['37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
    },
    {
        name: 'Black zip-up',
        price: 250.00,
        image_url: '/images/BlackZipup.jpg',
        images: ['/images/BlackZipup.jpg'],
        description: 'Custom made zip up shirt from 100% cotton with comfortable fit.',
        category: 'apparel',
        subcategory: 'tops',
        rating: 4.5,
        reviews: 15,
        in_stock: true,
        sizes: ['S', 'M', 'L', 'XL'],
        tags: ['basic', 'cotton', 'casual']
    },
    {
        name: 'SnP Criss Black',
        price: 25.00,
        image_url: '/images/SnPCrissBlack.jpg',
        images: ['/images/SnPCrissBlack.jpg'],
        description: 'Custom made zip-up for casual wear with woven fabric.',
        category: 'apparel',
        subcategory: 'zip-up',
        rating: 4.7,
        reviews: 21,
        in_stock: true,
        sizes: ['M', 'L', 'XL', 'XXL'],
        tags: ['casual', 'aesthetic', 'comfortable']
    },
    {
        name: 'Snp Criss Pink',
        price: 250,
        image_url: '/images/SnPCrissPink.jpg',
        images: ['/images/SnPCrissPink.jpg'],
        description: 'Warm and cozy sweater for cold weather made from premium wool blend.',
        category: 'apparel',
        subcategory: 'sweaters',
        rating: 4.6,
        reviews: 19,
        in_stock: true,
        sizes: ['M', 'L', 'XL', 'XXL'],
        tags: ['Casual', 'cozy', 'comfortable']
    },
    {
        name: 'SnP BlacknGold Zip-up',
        price: 250.00,
        image_url: '/images/BlacknGold.png',
        images: ['/images/BlacknGold.png'],
        description: 'Premium Black and Gold SnP Zip-Ups',
        category: 'apparel',
        subcategory: 'Zip-ups',
        rating: 4.4,
        reviews: 17,
        in_stock: true,
        sizes: ['L', 'XL', 'XXL'],
    },
    {
        name: 'Pink Zip-up',
        price: 250.00,
        image_url: '/images/PinkZipup.png',
        images: ['/images/PinkZipup.png'],
        description: 'SnP premium Pink Zipup.',
        category: 'apparel',
        subcategory: 'Zip-ups',
        rating: 4.6,
        reviews: 23,
        in_stock: true,
        sizes: ['L', 'XL'],
    },
    {
        name: 'WhitenGold Zip-Up',
        price: 250.00,
        image_url: '/images/WhitenGold.png',
        images: ['/images/WhitenGold.png'],
        description: 'Premium White and Gold zip-up.',
        category: 'apparel',
        subcategory: 'Zip-up',
        rating: 4.5,
        reviews: 20,
        in_stock: true,
        sizes: ['L', 'XL'],
    }
];

async function seedDatabase() {
    console.log('Seeding products to Supabase...');

    let successCount = 0;
    let failCount = 0;

    for (const product of products) {
        const { data, error } = await supabase
            .from('products')
            .insert([product]);

        if (error) {
            console.error(`❌ Failed to insert ${product.name}:`, error.message);
            failCount++;
        } else {
            console.log(`✅ Successfully inserted: ${product.name}`);
            successCount++;
        }
    }

    console.log(`\nSeed Complete!`);
    console.log(`✅ ${successCount} successful`);
    if (failCount > 0) console.log(`❌ ${failCount} failed`);
}

seedDatabase();
