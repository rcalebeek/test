-- MP Piping Inspection Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- OPERATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    certification_level VARCHAR(100),
    role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('operator', 'qc', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    client VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DRAWINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS drawings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drawing_number VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    revision VARCHAR(50),
    description TEXT,
    corner_photo_path TEXT,
    ocr_raw_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(drawing_number, project_id)
);

-- ============================================
-- PIPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipe_number VARCHAR(255) NOT NULL,
    drawing_id UUID REFERENCES drawings(id) ON DELETE SET NULL,
    specification VARCHAR(255),
    material VARCHAR(255),
    diameter VARCHAR(100),
    thickness VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pipes_pipe_number ON pipes(pipe_number);
CREATE INDEX IF NOT EXISTS idx_pipes_drawing_id ON pipes(drawing_id);

-- ============================================
-- WELDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS welds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipe_id UUID REFERENCES pipes(id) ON DELETE CASCADE NOT NULL,
    weld_number VARCHAR(255) NOT NULL,
    weld_position VARCHAR(100),
    component_type VARCHAR(100) CHECK (component_type IN ('flens', 'pijp', 'bocht', 't-stuk', 'reducer', 'cap', 'anders')),
    component_description TEXT,
    welder_id VARCHAR(100),
    weld_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pipe_id, weld_number)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_welds_weld_number ON welds(weld_number);
CREATE INDEX IF NOT EXISTS idx_welds_pipe_id ON welds(pipe_id);

-- ============================================
-- INSPECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weld_id UUID REFERENCES welds(id) ON DELETE CASCADE NOT NULL,
    inspection_type VARCHAR(50) DEFAULT 'MP' CHECK (inspection_type IN ('MP', 'PT', 'RT', 'UT', 'VT')),
    operator_id UUID REFERENCES operators(id) ON DELETE SET NULL,
    inspection_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'ok', 'nok', 'twijfel', 'herstel')),
    remarks TEXT,
    acceptance_criteria VARCHAR(255),
    procedure_number VARCHAR(255),
    equipment_used TEXT,
    ambient_conditions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_inspections_weld_id ON inspections(weld_id);
CREATE INDEX IF NOT EXISTS idx_inspections_operator_id ON inspections(operator_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date);

-- ============================================
-- PHOTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    file_name VARCHAR(255),
    photo_type VARCHAR(50) CHECK (photo_type IN ('overzicht', 'detail', 'indicatie', 'afkeur', 'herstel', 'tekening')),
    photo_status VARCHAR(50) DEFAULT 'ok' CHECK (photo_status IN ('ok', 'nok', 'twijfel')),
    ocr_text TEXT,
    remarks TEXT,
    sequence_number INTEGER DEFAULT 1,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_photos_inspection_id ON photos(inspection_id);
CREATE INDEX IF NOT EXISTS idx_photos_photo_type ON photos(photo_type);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE welds ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Operators policies
CREATE POLICY "Operators can view all operators" ON operators
    FOR SELECT USING (true);

CREATE POLICY "Operators can update own profile" ON operators
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage operators" ON operators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM operators
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'qc')
        )
    );

-- Projects policies (everyone can read, admins can write)
CREATE POLICY "Everyone can view projects" ON projects
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage projects" ON projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM operators
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'qc')
        )
    );

-- Drawings policies
CREATE POLICY "Everyone can view drawings" ON drawings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create drawings" ON drawings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update drawings" ON drawings
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Pipes policies
CREATE POLICY "Everyone can view pipes" ON pipes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create pipes" ON pipes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update pipes" ON pipes
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Welds policies
CREATE POLICY "Everyone can view welds" ON welds
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create welds" ON welds
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update welds" ON welds
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Inspections policies
CREATE POLICY "Everyone can view inspections" ON inspections
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create inspections" ON inspections
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Operators can update own inspections" ON inspections
    FOR UPDATE USING (
        operator_id IN (
            SELECT id FROM operators WHERE user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM operators
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'qc')
        )
    );

-- Photos policies
CREATE POLICY "Everyone can view photos" ON photos
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create photos" ON photos
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update photos" ON photos
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Audit logs policies (admins only)
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM operators
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'qc')
        )
    );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drawings_updated_at BEFORE UPDATE ON drawings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipes_updated_at BEFORE UPDATE ON pipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_welds_updated_at BEFORE UPDATE ON welds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUDIT LOG TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to main tables
CREATE TRIGGER audit_inspections AFTER INSERT OR UPDATE OR DELETE ON inspections
    FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_welds AFTER INSERT OR UPDATE OR DELETE ON welds
    FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_photos AFTER INSERT OR UPDATE OR DELETE ON photos
    FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

-- ============================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- ============================================
-- Note: Storage buckets should be created via Supabase Dashboard or API
-- Bucket name: inspection-photos
-- Public: false
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- ============================================
-- HELPFUL VIEWS
-- ============================================

CREATE OR REPLACE VIEW inspection_summary AS
SELECT
    i.id as inspection_id,
    i.inspection_date,
    i.status as inspection_status,
    i.inspection_type,
    i.remarks as inspection_remarks,
    w.weld_number,
    w.weld_position,
    w.component_type,
    p.pipe_number,
    d.drawing_number,
    pr.name as project_name,
    pr.code as project_code,
    o.name as operator_name,
    (SELECT COUNT(*) FROM photos ph WHERE ph.inspection_id = i.id) as photo_count
FROM inspections i
LEFT JOIN welds w ON i.weld_id = w.id
LEFT JOIN pipes p ON w.pipe_id = p.id
LEFT JOIN drawings d ON p.drawing_id = d.id
LEFT JOIN projects pr ON d.project_id = pr.id
LEFT JOIN operators o ON i.operator_id = o.id
ORDER BY i.inspection_date DESC, i.created_at DESC;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a default project
INSERT INTO projects (name, code, description, client)
VALUES ('Standaard Project', 'DEFAULT', 'Standaard project voor testen', 'Intern')
ON CONFLICT (code) DO NOTHING;
