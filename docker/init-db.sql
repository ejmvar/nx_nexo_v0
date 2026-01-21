-- NEXO CRM Database Initialization
-- ===================================
-- Creates initial database structure for the NEXO CRM system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
CREATE TYPE user_role AS ENUM ('employee', 'client', 'supplier', 'professional', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE project_status AS ENUM ('planning', 'in-progress', 'completed', 'cancelled', 'on-hold');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

-- Users table (unified for all portal types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'active',
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Employees table (extends users)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE NOT NULL,
    salary_level VARCHAR(50),
    manager_id UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clients table (extends users)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255),
    tax_id VARCHAR(50),
    billing_address TEXT,
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    account_manager_id UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table (extends users)
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    business_address TEXT,
    payment_terms VARCHAR(100),
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Professionals table (extends users - freelancers/contractors)
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    professional_code VARCHAR(50) UNIQUE NOT NULL,
    specialty VARCHAR(100),
    hourly_rate DECIMAL(10, 2),
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    years_experience INTEGER DEFAULT 0,
    certifications TEXT[],
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'planning',
    client_id UUID REFERENCES clients(id),
    budget DECIMAL(12, 2),
    start_date DATE,
    deadline DATE,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status order_status DEFAULT 'pending',
    client_id UUID REFERENCES clients(id),
    supplier_id UUID REFERENCES suppliers(id),
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
-- Admin user
INSERT INTO users (email, password_hash, role, status, first_name, last_name) VALUES
('admin@nexo.com', crypt('admin123', gen_salt('bf')), 'admin', 'active', 'System', 'Administrator');

-- Sample employee
INSERT INTO users (email, password_hash, role, status, first_name, last_name, phone) VALUES
('employee@nexo.com', crypt('employee123', gen_salt('bf')), 'employee', 'active', 'John', 'Employee', '+1234567890');
INSERT INTO employees (user_id, employee_code, department, position, hire_date) VALUES
((SELECT id FROM users WHERE email = 'employee@nexo.com'), 'EMP001', 'Sales', 'Sales Manager', '2024-01-15');

-- Sample client
INSERT INTO users (email, password_hash, role, status, first_name, last_name) VALUES
('client@nexo.com', crypt('client123', gen_salt('bf')), 'client', 'active', 'Jane', 'Client');
INSERT INTO clients (user_id, client_code, company_name, tax_id, credit_limit) VALUES
((SELECT id FROM users WHERE email = 'client@nexo.com'), 'CLI001', 'ACME Corporation', 'TAX123456', 50000.00);

-- Sample supplier
INSERT INTO users (email, password_hash, role, status, first_name, last_name) VALUES
('supplier@nexo.com', crypt('supplier123', gen_salt('bf')), 'supplier', 'active', 'Bob', 'Supplier');
INSERT INTO suppliers (user_id, supplier_code, company_name, tax_id, rating) VALUES
((SELECT id FROM users WHERE email = 'supplier@nexo.com'), 'SUP001', 'Supply Co', 'TAX789012', 4.5);

-- Sample professional
INSERT INTO users (email, password_hash, role, status, first_name, last_name) VALUES
('professional@nexo.com', crypt('professional123', gen_salt('bf')), 'professional', 'active', 'Alice', 'Professional');
INSERT INTO professionals (user_id, professional_code, specialty, hourly_rate, rating, years_experience) VALUES
((SELECT id FROM users WHERE email = 'professional@nexo.com'), 'PRO001', 'Software Development', 85.00, 4.8, 8);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nexo_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nexo_admin;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'NEXO CRM Database initialized successfully!';
    RAISE NOTICE 'Sample credentials:';
    RAISE NOTICE '  Admin: admin@nexo.com / admin123';
    RAISE NOTICE '  Employee: employee@nexo.com / employee123';
    RAISE NOTICE '  Client: client@nexo.com / client123';
    RAISE NOTICE '  Supplier: supplier@nexo.com / supplier123';
    RAISE NOTICE '  Professional: professional@nexo.com / professional123';
END $$;