DO $$
BEGIN
    -- 1. Ensure foreign key from cart_items.product_id to products.id exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.referential_constraints 
        WHERE constraint_name = 'cart_items_product_id_fkey'
    ) THEN
        -- Check if a different constraint exists or just add it
        -- We'll try to add it. If it fails due to existing data violating it, user will see error.
        ALTER TABLE public.cart_items
        ADD CONSTRAINT cart_items_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES public.products(id)
        ON DELETE CASCADE;
    END IF;

    -- 2. Ensure foreign key from cart_items.user_id to auth.users exists
    -- This is crucial for RLS to work securely with auth.uid()
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.referential_constraints 
        WHERE constraint_name = 'cart_items_user_id_fkey'
    ) THEN
        ALTER TABLE public.cart_items
        ADD CONSTRAINT cart_items_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
    
    -- 3. (Removed order_items check as table does not exist)

END $$;
