# Data Flow Analysis & Action Plan

## 1. Data Display Method (Display Analysis)

Currently, the application uses a **hybrid data flow** that is inconsistent across different features:

*   **User Profile, Cart, & Orders:** These features use a **Service-to-Context** pattern. The data is fetched from Supabase via service files (`supabaseService.ts`), stored in a React Context (`AuthProvider`, `CartProvider`), and exposed to components via custom hooks (`useAuth`, `useCart`). This is the correct, modern approach.
*   **Products:** This is the **critical issue**. While a `ProductService` and a `ProductProvider` exist, the actual UI components (like `ProductCarousel.tsx` and `CategorySection.tsx`) are **bypassing** this layer entirely. They are directly importing a static array `products` from `src/utils/data.ts`. This means even if the database is updated, the website will still show the hardcoded file data.

## 2. Mock vs. Backend (Connection Status)

| Service | Function | Status | Details |
| :--- | :--- | :--- | :--- |
| **UserProfileService** | `getUserProfile` | 🟢 **Connected** | Fully fetches from Supabase `user_profiles` table via `useAuthSupabase`. |
| **CartService** | `getCart`, `addToCart` | 🟢 **Connected** | Fetches from Supabase `cart_items`. Has a fallback to `localStorage` if the user is not logged in. |
| **OrderService** | `getUserOrders` | 🟢 **Connected** | Fetches from Supabase `orders` table. |
| **ProductService** | `getAllProducts` | 🔴 **Disconnected** | The *function* exists and works, but the **UI Components** (Home, Shop) do not use it. They use `import { products } from '../../utils/data'`. |
| **ProductService** | `getProductById` | 🔴 **Disconnected** | `ProductDetail` page likely relies on the same static `data.ts` file or a hook that defaults to it. |

## 3. Action Plan (Next Steps)

To fully connect the store to the backend, the product components must be refactored to stop reading from the static file and start reading from the `ProductContext`.

### Priority 1: Connect Product Data Flow
1.  **Refactor `ProductCarousel.tsx`**: 
    *   Remove `import { products } from '../../utils/data'`.
    *   Update it to accept a `products` prop or use the `useProducts()` hook to get the real data.
2.  **Refactor `CategorySection.tsx`**: 
    *   Replace the direct data import with data from the `useProducts()` hook.
3.  **Refactor `Shop.tsx`**: 
    *   Ensure it passes the dynamic product data down to its children.
4.  **Verify `ProductDetail.tsx`**: 
    *   Ensure the individual product page fetches the specific product from the Context/Service, not the static array.

### Priority 2: Cleanup
5.  **Deprecate `src/utils/data.ts`**: 
    *   Once the UI is connected to Supabase, rename this file to `data.backup.ts` or delete it to ensure no components accidentally rely on it in the future.
