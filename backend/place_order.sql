DO $create$
BEGIN
    -- 1. Enable Row Level Security on Tables (if not already enabled)
    -- We check existence and enable RLS safely.
    
    -- Table: public.user_profiles
    IF to_regclass('public.user_profiles') IS NOT NULL THEN
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Table: public.orders
    IF to_regclass('public.orders') IS NOT NULL THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        
        -- Ensure items column exists since we removed order_items table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'items') THEN
            ALTER TABLE public.orders ADD COLUMN items JSONB;
        END IF;
    END IF;

    -- Table: public.order_items
    IF to_regclass('public.order_items') IS NOT NULL THEN
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Table: public.cart_items
    IF to_regclass('public.cart_items') IS NOT NULL THEN
        ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
    END IF;

END $create$;

-- 2. Create RLS Policies
-- We drop existing policies to ensure clean state or use conditional creation logic.
-- For simplicity in a script, it's often easier to drop and recreate.

DO $pol$
BEGIN
    -- Policies for user_profiles
    IF to_regclass('public.user_profiles') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
        CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
        
        DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
        CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
        
        DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
        CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    -- Policies for cart_items
    IF to_regclass('public.cart_items') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart_items;
        CREATE POLICY "Users can view their own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can insert their own cart" ON public.cart_items;
        CREATE POLICY "Users can insert their own cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can update their own cart" ON public.cart_items;
        CREATE POLICY "Users can update their own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can delete their own cart" ON public.cart_items;
        CREATE POLICY "Users can delete their own cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Policies for orders
    IF to_regclass('public.orders') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
        CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
        CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

END $pol$;

-- 3. Create the place_order Function
CREATE OR REPLACE FUNCTION public.place_order(
    p_user_id UUID,
    p_order_number TEXT,
    p_total_amount NUMERIC,
    p_status TEXT,
    p_payment_method TEXT,
    p_shipping_address JSONB,
    p_items JSONB
) RETURNS JSONB AS $fn$
DECLARE
    v_order_id UUID;
BEGIN
    -- Insert into orders
    INSERT INTO public.orders (
        user_id,
        order_number,
        total_amount,
        status,
        payment_method,
        shipping_address,
        items
    ) VALUES (
        p_user_id,
        p_order_number,
        p_total_amount,
        p_status,
        p_payment_method,
        p_shipping_address,
        p_items
    ) RETURNING id INTO v_order_id;

    -- Clear cart_items for the user
    DELETE FROM public.cart_items WHERE user_id = p_user_id;

    -- Return success response
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'message', 'Order placed successfully'
    );

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to place order: %', SQLERRM;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;
