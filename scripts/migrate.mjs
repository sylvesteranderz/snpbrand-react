import fs from 'fs';
import path from 'path';

// Define the absolute path to the src directory
const SRC_DIR = path.resolve('c:/Users/slyboy/Desktop/Productivity/snpbrand-react/src');

// Define the migration map relative to src
const MIGRATION_MAP = {
    // auth
    'components/GoogleOneTap.tsx': 'features/auth/components/GoogleOneTap.tsx',
    'components/ProtectedRoute.tsx': 'features/auth/components/ProtectedRoute.tsx',
    'hooks/useAuth.tsx': 'features/auth/hooks/useAuth.tsx',
    'hooks/useAuthSupabase.tsx': 'features/auth/hooks/useAuthSupabase.tsx',
    'pages/Account.tsx': 'features/auth/pages/Account.tsx',
    'pages/Login.tsx': 'features/auth/pages/Login.tsx',
    'pages/Signup.tsx': 'features/auth/pages/Signup.tsx',
    'pages/VerificationPending.tsx': 'features/auth/pages/VerificationPending.tsx',

    // products
    'components/ProductCard.tsx': 'features/products/components/ProductCard.tsx',
    'components/sections/ProductGrid.tsx': 'features/products/components/ProductGrid.tsx',
    'components/sections/ProductCarousel.tsx': 'features/products/components/ProductCarousel.tsx',
    'components/AddProductForm.tsx': 'features/products/components/AddProductForm.tsx',
    'hooks/useProducts.tsx': 'features/products/hooks/useProducts.tsx',
    'hooks/useProductsSupabase.tsx': 'features/products/hooks/useProductsSupabase.tsx',
    'pages/ProductDetail.tsx': 'features/products/pages/ProductDetail.tsx',
    'pages/Shop.tsx': 'features/products/pages/Shop.tsx',

    // cart
    'components/CartSidebar.tsx': 'features/cart/components/CartSidebar.tsx',
    'components/AddToCartModal.tsx': 'features/cart/components/AddToCartModal.tsx',
    'hooks/useCart.tsx': 'features/cart/hooks/useCart.tsx',
    'hooks/useCartSupabase.tsx': 'features/cart/hooks/useCartSupabase.tsx',
    'pages/Cart.tsx': 'features/cart/pages/Cart.tsx',

    // checkout
    'pages/Checkout.tsx': 'features/checkout/pages/Checkout.tsx',
    'pages/OrderConfirmation.tsx': 'features/checkout/pages/OrderConfirmation.tsx',

    // orders
    'pages/Orders.tsx': 'features/orders/pages/Orders.tsx',
    'pages/OrderTracking.tsx': 'features/orders/pages/OrderTracking.tsx',

    // wishlist
    'hooks/useWishlist.tsx': 'features/wishlist/hooks/useWishlist.tsx',
    'hooks/useWishlistSupabase.tsx': 'features/wishlist/hooks/useWishlistSupabase.tsx',
    'pages/Wishlist.tsx': 'features/wishlist/pages/Wishlist.tsx',

    // admin
    'pages/AdminDashboard.tsx': 'features/admin/pages/AdminDashboard.tsx',

    // blog
    'components/sections/BlogSection.tsx': 'features/blog/components/BlogSection.tsx',
    'pages/Blog.tsx': 'features/blog/pages/Blog.tsx',

    // home
    'components/sections/HeroSection.tsx': 'features/home/components/HeroSection.tsx',
    'components/sections/LuxuryHeroSection.tsx': 'features/home/components/LuxuryHeroSection.tsx',
    'components/sections/BannerSection.tsx': 'features/home/components/BannerSection.tsx',
    'components/sections/CategorySection.tsx': 'features/home/components/CategorySection.tsx',
    'components/sections/ServiceSection.tsx': 'features/home/components/ServiceSection.tsx',
    'components/sections/InstagramSection.tsx': 'features/home/components/InstagramSection.tsx',
    'components/sections/AnimatedOutfitSection.tsx': 'features/home/components/AnimatedOutfitSection.tsx',
    'pages/Home.tsx': 'features/home/pages/Home.tsx',
    'pages/AnimatedSlipperDemo.tsx': 'features/home/pages/AnimatedSlipperDemo.tsx',

    // common
    'components/Header.tsx': 'features/common/components/Header.tsx',
    'components/Footer.tsx': 'features/common/components/Footer.tsx',
    'components/LoadingScreen.tsx': 'features/common/components/LoadingScreen.tsx',
    'components/Preloader.tsx': 'features/common/components/Preloader.tsx',
    'components/LuxuryLoader.tsx': 'features/common/components/LuxuryLoader.tsx',
    'components/ScrollAnimation.tsx': 'features/common/components/ScrollAnimation.tsx',
    'components/ScrollToTop.tsx': 'features/common/components/ScrollToTop.tsx',
    'components/SearchSidebar.tsx': 'features/common/components/SearchSidebar.tsx',
    'components/TypewriterText.tsx': 'features/common/components/TypewriterText.tsx',
    'components/AnimatedBackground.tsx': 'features/common/components/AnimatedBackground.tsx',
    'components/AnimatedSlipper.tsx': 'features/common/components/AnimatedSlipper.tsx',
    'components/AdvancedAnimatedSlipper.tsx': 'features/common/components/AdvancedAnimatedSlipper.tsx',
    'components/sections/NewsletterSection.tsx': 'features/common/components/NewsletterSection.tsx',
    'components/sections/TestimonialSection.tsx': 'features/common/components/TestimonialSection.tsx',
    'pages/Contact.tsx': 'features/common/pages/Contact.tsx'
};

// Helper: Get destination path relative to src for a given relative or absolute import
function getNewImportPath(currentFilePathRelative, importPath) {
    if (!importPath.startsWith('.')) return importPath; // Not a local import (e.g. 'react')

    const parsedCurrent = path.parse(currentFilePathRelative);
    // Resolve relative import to absolute src-based path
    // Since importPath drops extensions sometimes, we'll try to find it
    const dir = path.dirname(currentFilePathRelative);

    let resolvedSrcPath = path.normalize(path.join(dir, importPath)).replace(/\\/g, '/');

    // Find if this specific target moved!
    // It might reference a file without extension (e.g. '../components/Header')
    let targetFileMoveMatch = null;
    for (const oldFile of Object.keys(MIGRATION_MAP)) {
        // If the imported path exactly matches the old file name without extension
        const oldFileWithoutExt = oldFile.replace(/\.(tsx|ts)$/, '');
        if (resolvedSrcPath === oldFile || resolvedSrcPath === oldFileWithoutExt) {
            targetFileMoveMatch = MIGRATION_MAP[oldFile];
            break;
        }
    }

    const finalSrcPath = targetFileMoveMatch || resolvedSrcPath;
    // Format as module alias @/... 
    return `@/${finalSrcPath.replace(/\.(tsx|ts)$/, '')}`;
}

async function migrate() {
    console.log("Starting Migration Process...");

    // Get all TS/TSX files
    const filesToProcess = [];
    function scanDir(dir) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            if (item === 'node_modules') continue;
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDir(fullPath);
            } else if (fullPath.match(/\.(tsx?)$/)) {
                filesToProcess.push(fullPath);
            }
        }
    }
    scanDir(SRC_DIR);

    const fileUpdates = [];

    // Step 1: Read all files and rewrite imports.
    for (const fullPath of filesToProcess) {
        let content = fs.readFileSync(fullPath, 'utf8');
        const relativePath = path.relative(SRC_DIR, fullPath).replace(/\\/g, '/');

        // Rewrite relative imports using Regex
        // This matches `import { x } from './path'` or `import x from '../path'`
        const importRegex = /(import\s+.*?\s+from\s+['"])(.+?)(['"])/g;
        let modifiedCount = 0;
        const newContent = content.replace(importRegex, (match, prefix, importStr, suffix) => {
            const newImportStr = getNewImportPath(relativePath, importStr);
            if (importStr !== newImportStr) modifiedCount++;
            return `${prefix}${newImportStr}${suffix}`;
        });

        // Also catch dynamic imports, e.g. delay loading
        const dynamicRegex = /(import\(['"])(.+?)(['"]\))/g;
        const finalContent = newContent.replace(dynamicRegex, (match, prefix, importStr, suffix) => {
            const newImportStr = getNewImportPath(relativePath, importStr);
            if (importStr !== newImportStr) modifiedCount++;
            return `${prefix}${newImportStr}${suffix}`;
        });


        // Determine destination
        const destRelative = Object.keys(MIGRATION_MAP).includes(relativePath)
            ? MIGRATION_MAP[relativePath]
            : relativePath;

        fileUpdates.push({
            originalFullPath: fullPath,
            destFullPath: path.join(SRC_DIR, destRelative),
            content: finalContent,
            modifiedCount
        });
    }

    // Step 2: Write logic - create directories and move files
    console.log(`Prepared ${fileUpdates.length} files. Writing to new locations...`);

    // First, write ALL new files. 
    // We don't delete immediately to be safe. We'll delete old paths when all new ones are solid.
    for (const f of fileUpdates) {
        fs.mkdirSync(path.dirname(f.destFullPath), { recursive: true });
        fs.writeFileSync(f.destFullPath, f.content);
    }

    console.log("Written successfully. Cleaning up old files...");

    // Step 3: Remove old files that were moved
    for (const oldFile of Object.keys(MIGRATION_MAP)) {
        const fullOldPath = path.join(SRC_DIR, oldFile);
        if (fs.existsSync(fullOldPath)) {
            // Don't delete if the source and dest are the same (shouldn't happen here)
            if (oldFile !== MIGRATION_MAP[oldFile]) {
                fs.unlinkSync(fullOldPath);
            }
        }
    }

    console.log("Migration Complete ✨ Run 'npm run dev' to verify!");
}

migrate();
