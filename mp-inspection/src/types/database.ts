export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      operators: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          certification_level: string | null
          role: 'operator' | 'qc' | 'admin'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          certification_level?: string | null
          role?: 'operator' | 'qc' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          certification_level?: string | null
          role?: 'operator' | 'qc' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          client: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          description?: string | null
          client?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          description?: string | null
          client?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      drawings: {
        Row: {
          id: string
          drawing_number: string
          project_id: string | null
          revision: string | null
          description: string | null
          corner_photo_path: string | null
          ocr_raw_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          drawing_number: string
          project_id?: string | null
          revision?: string | null
          description?: string | null
          corner_photo_path?: string | null
          ocr_raw_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          drawing_number?: string
          project_id?: string | null
          revision?: string | null
          description?: string | null
          corner_photo_path?: string | null
          ocr_raw_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pipes: {
        Row: {
          id: string
          pipe_number: string
          drawing_id: string | null
          specification: string | null
          material: string | null
          diameter: string | null
          thickness: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pipe_number: string
          drawing_id?: string | null
          specification?: string | null
          material?: string | null
          diameter?: string | null
          thickness?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pipe_number?: string
          drawing_id?: string | null
          specification?: string | null
          material?: string | null
          diameter?: string | null
          thickness?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      welds: {
        Row: {
          id: string
          pipe_id: string
          weld_number: string
          weld_position: string | null
          component_type: 'flens' | 'pijp' | 'bocht' | 't-stuk' | 'reducer' | 'cap' | 'anders' | null
          component_description: string | null
          welder_id: string | null
          weld_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pipe_id: string
          weld_number: string
          weld_position?: string | null
          component_type?: 'flens' | 'pijp' | 'bocht' | 't-stuk' | 'reducer' | 'cap' | 'anders' | null
          component_description?: string | null
          welder_id?: string | null
          weld_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pipe_id?: string
          weld_number?: string
          weld_position?: string | null
          component_type?: 'flens' | 'pijp' | 'bocht' | 't-stuk' | 'reducer' | 'cap' | 'anders' | null
          component_description?: string | null
          welder_id?: string | null
          weld_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inspections: {
        Row: {
          id: string
          weld_id: string
          inspection_type: 'MP' | 'PT' | 'RT' | 'UT' | 'VT'
          operator_id: string | null
          inspection_date: string
          status: 'pending' | 'ok' | 'nok' | 'twijfel' | 'herstel'
          remarks: string | null
          acceptance_criteria: string | null
          procedure_number: string | null
          equipment_used: string | null
          ambient_conditions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          weld_id: string
          inspection_type?: 'MP' | 'PT' | 'RT' | 'UT' | 'VT'
          operator_id?: string | null
          inspection_date?: string
          status?: 'pending' | 'ok' | 'nok' | 'twijfel' | 'herstel'
          remarks?: string | null
          acceptance_criteria?: string | null
          procedure_number?: string | null
          equipment_used?: string | null
          ambient_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          weld_id?: string
          inspection_type?: 'MP' | 'PT' | 'RT' | 'UT' | 'VT'
          operator_id?: string | null
          inspection_date?: string
          status?: 'pending' | 'ok' | 'nok' | 'twijfel' | 'herstel'
          remarks?: string | null
          acceptance_criteria?: string | null
          procedure_number?: string | null
          equipment_used?: string | null
          ambient_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          inspection_id: string
          storage_path: string
          storage_url: string | null
          file_name: string | null
          photo_type: 'overzicht' | 'detail' | 'indicatie' | 'afkeur' | 'herstel' | 'tekening' | null
          photo_status: 'ok' | 'nok' | 'twijfel'
          ocr_text: string | null
          remarks: string | null
          sequence_number: number
          file_size: number | null
          mime_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          storage_path: string
          storage_url?: string | null
          file_name?: string | null
          photo_type?: 'overzicht' | 'detail' | 'indicatie' | 'afkeur' | 'herstel' | 'tekening' | null
          photo_status?: 'ok' | 'nok' | 'twijfel'
          ocr_text?: string | null
          remarks?: string | null
          sequence_number?: number
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inspection_id?: string
          storage_path?: string
          storage_url?: string | null
          file_name?: string | null
          photo_type?: 'overzicht' | 'detail' | 'indicatie' | 'afkeur' | 'herstel' | 'tekening' | null
          photo_status?: 'ok' | 'nok' | 'twijfel'
          ocr_text?: string | null
          remarks?: string | null
          sequence_number?: number
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data: Json | null
          new_data: Json | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          user_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      inspection_summary: {
        Row: {
          inspection_id: string | null
          inspection_date: string | null
          inspection_status: string | null
          inspection_type: string | null
          inspection_remarks: string | null
          weld_number: string | null
          weld_position: string | null
          component_type: string | null
          pipe_number: string | null
          drawing_number: string | null
          project_name: string | null
          project_code: string | null
          operator_name: string | null
          photo_count: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Utility types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Operator = Tables<'operators'>
export type Project = Tables<'projects'>
export type Drawing = Tables<'drawings'>
export type Pipe = Tables<'pipes'>
export type Weld = Tables<'welds'>
export type Inspection = Tables<'inspections'>
export type Photo = Tables<'photos'>
export type AuditLog = Tables<'audit_logs'>
