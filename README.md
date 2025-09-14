# SnP Brand - React E-commerce Store

A modern, responsive e-commerce website built with React, TypeScript, and Tailwind CSS. This project is a complete migration and improvement of the original HTML/CSS/JavaScript SnP Brand website.

## 🚀 Features

### Modern Tech Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **React Router** for client-side routing
- **Swiper.js** for carousels and sliders

### E-commerce Features
- 🛒 **Shopping Cart** with persistent state management
- ❤️ **Wishlist** functionality
- 🔍 **Product Search** and filtering
- 📱 **Responsive Design** for all devices
- 🎨 **Modern UI/UX** with smooth animations
- ⚡ **Performance Optimized** with lazy loading
- 🌙 **Dark Mode Ready** (easily implementable)

### Pages & Components
- **Home Page** with hero slider, product carousels, and featured sections
- **Shop Page** with advanced filtering and sorting
- **Product Detail** with image gallery and product options
- **Cart & Wishlist** with full functionality
- **Blog** with article listings
- **Contact** with form and business information

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone or navigate to the project directory:**
   ```bash
   cd snpbrand-react
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

### Build for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
snpbrand-react/
├── public/
│   └── images/          # Static images and assets
├── src/
│   ├── components/      # Reusable React components
│   │   ├── sections/    # Page sections (Hero, ProductGrid, etc.)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── ...
│   ├── pages/          # Page components
│   │   ├── Home.tsx
│   │   ├── Shop.tsx
│   │   ├── ProductDetail.tsx
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   │   ├── useCart.tsx
│   │   └── useWishlist.tsx
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions and data
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles and Tailwind imports
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Design Improvements

### Visual Enhancements
- **Modern Color Palette** with primary and accent colors
- **Improved Typography** with custom font combinations
- **Smooth Animations** using Framer Motion
- **Better Spacing** and layout consistency
- **Enhanced Product Cards** with hover effects
- **Professional Forms** with better UX

### User Experience
- **Faster Loading** with optimized images and code splitting
- **Better Navigation** with clear visual hierarchy
- **Mobile-First Design** that works on all devices
- **Accessibility Improvements** with proper ARIA labels
- **Interactive Elements** with hover and focus states

### Performance Optimizations
- **Code Splitting** for faster initial load
- **Image Optimization** with proper sizing
- **Lazy Loading** for better performance
- **Efficient State Management** with React Context
- **Optimized Bundle Size** with tree shaking

## 🛒 E-commerce Features

### Shopping Cart
- Add/remove products
- Quantity management
- Persistent state across sessions
- Real-time total calculation
- Sidebar cart with smooth animations

### Wishlist
- Save favorite products
- Quick add to cart from wishlist
- Persistent storage
- Visual feedback for wishlist status

### Product Management
- Product filtering by category
- Price range filtering
- Search functionality
- Sorting options (name, price, rating)
- Product variants (size, color)

## 🎯 Key Improvements Over Original

1. **Modern Framework**: Migrated from vanilla HTML/CSS/JS to React with TypeScript
2. **Better Performance**: Optimized loading and rendering
3. **Enhanced UX**: Smooth animations and better interactions
4. **Mobile Responsive**: Improved mobile experience
5. **State Management**: Proper cart and wishlist state handling
6. **Code Organization**: Clean, maintainable component structure
7. **Type Safety**: Full TypeScript implementation
8. **Modern Styling**: Tailwind CSS for consistent design system

## 🚀 Deployment

The project is ready for deployment on platforms like:
- Vercel
- Netlify
- AWS Amplify
- GitHub Pages

Simply run `npm run build` and deploy the `dist` folder.

## 📝 Customization

### Colors
Update the color palette in `tailwind.config.js`:
```javascript
colors: {
  primary: { /* your primary colors */ },
  accent: { /* your accent colors */ },
  // ...
}
```

### Content
Update product data in `src/utils/data.ts` to match your inventory.

### Styling
Modify components in `src/components/` to customize the appearance.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is based on the original SnP Brand template and follows the same licensing terms.

## 🙏 Acknowledgments

- Original design by TemplatesJungle
- Icons by Lucide React
- Animations by Framer Motion
- Styling by Tailwind CSS

---

**Note**: This is a complete migration and improvement of the original HTML template. All functionality has been recreated and enhanced using modern React patterns and best practices.
