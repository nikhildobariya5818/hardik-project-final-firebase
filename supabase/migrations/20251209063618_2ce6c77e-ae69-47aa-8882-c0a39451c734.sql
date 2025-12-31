-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create enum for material types
CREATE TYPE public.material_type AS ENUM ('RETI', 'KAPCHI', 'GSB', 'RABAR');

-- Create enum for payment modes
CREATE TYPE public.payment_mode AS ENUM ('Cash', 'UPI', 'Bank');

-- Create user_roles table (for role-based access)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    opening_balance NUMERIC(12,2) DEFAULT 0,
    current_balance NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    order_time TIME NOT NULL DEFAULT CURRENT_TIME,
    weight NUMERIC(10,3) NOT NULL,
    material material_type NOT NULL,
    rate NUMERIC(10,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    location TEXT,
    truck_number TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12,2) NOT NULL,
    mode payment_mode NOT NULL DEFAULT 'Cash',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create material_rates table
CREATE TABLE public.material_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material material_type NOT NULL UNIQUE,
    rate NUMERIC(10,2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company_settings table
CREATE TABLE public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'My Company',
    address TEXT,
    phone TEXT,
    gst_number TEXT,
    invoice_prefix TEXT DEFAULT 'INV',
    next_invoice_number INTEGER DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_number TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    bill_month DATE NOT NULL,
    orders_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    previous_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_payable NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    remaining_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'admin')
$$;

-- Create function to check if user is authenticated (admin or staff)
CREATE OR REPLACE FUNCTION public.is_authenticated_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
    )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_authenticated_user(auth.uid()));

-- RLS Policies for clients (admin and staff can view, only admin can modify)
CREATE POLICY "Authenticated users can view clients" ON public.clients
    FOR SELECT USING (public.is_authenticated_user(auth.uid()));

CREATE POLICY "Admins can manage clients" ON public.clients
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for orders
CREATE POLICY "Authenticated users can view orders" ON public.orders
    FOR SELECT USING (public.is_authenticated_user(auth.uid()));

CREATE POLICY "Authenticated users can insert orders" ON public.orders
    FOR INSERT WITH CHECK (public.is_authenticated_user(auth.uid()));

CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete orders" ON public.orders
    FOR DELETE USING (public.is_admin(auth.uid()));

-- RLS Policies for payments
CREATE POLICY "Authenticated users can view payments" ON public.payments
    FOR SELECT USING (public.is_authenticated_user(auth.uid()));

CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for material_rates
CREATE POLICY "Authenticated users can view rates" ON public.material_rates
    FOR SELECT USING (public.is_authenticated_user(auth.uid()));

CREATE POLICY "Admins can manage rates" ON public.material_rates
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for company_settings
CREATE POLICY "Authenticated users can view settings" ON public.company_settings
    FOR SELECT USING (public.is_authenticated_user(auth.uid()));

CREATE POLICY "Admins can manage settings" ON public.company_settings
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for vehicles
CREATE POLICY "Authenticated users can view vehicles" ON public.vehicles
    FOR SELECT USING (public.is_authenticated_user(auth.uid()));

CREATE POLICY "Admins can manage vehicles" ON public.vehicles
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for invoices
CREATE POLICY "Authenticated users can view invoices" ON public.invoices
    FOR SELECT USING (public.is_authenticated_user(auth.uid()));

CREATE POLICY "Admins can manage invoices" ON public.invoices
    FOR ALL USING (public.is_admin(auth.uid()));

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update client balance after order
CREATE OR REPLACE FUNCTION public.update_client_balance_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.clients
        SET current_balance = current_balance + NEW.total,
            updated_at = now()
        WHERE id = NEW.client_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.clients
        SET current_balance = current_balance - OLD.total,
            updated_at = now()
        WHERE id = OLD.client_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.clients
        SET current_balance = current_balance - OLD.total + NEW.total,
            updated_at = now()
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_change
    AFTER INSERT OR UPDATE OR DELETE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_client_balance_on_order();

-- Create function to update client balance after payment
CREATE OR REPLACE FUNCTION public.update_client_balance_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.clients
        SET current_balance = current_balance - NEW.amount,
            updated_at = now()
        WHERE id = NEW.client_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.clients
        SET current_balance = current_balance + OLD.amount,
            updated_at = now()
        WHERE id = OLD.client_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_payment_change
    AFTER INSERT OR DELETE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_client_balance_on_payment();

-- Insert default material rates
INSERT INTO public.material_rates (material, rate) VALUES
    ('RETI', 100.00),
    ('KAPCHI', 150.00),
    ('GSB', 200.00),
    ('RABAR', 120.00);

-- Insert default company settings
INSERT INTO public.company_settings (company_name, address, phone, invoice_prefix, next_invoice_number)
VALUES ('My Company', 'Company Address', '1234567890', 'INV', 1);
