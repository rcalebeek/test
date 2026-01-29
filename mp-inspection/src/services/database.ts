import { createClient } from '@/lib/supabase/client'
import type {
  Drawing,
  Pipe,
  Weld,
  Inspection,
  Photo,
  InsertTables,
  UpdateTables,
} from '@/types/database'

// ============================================
// DRAWINGS
// ============================================

export async function createDrawing(drawing: InsertTables<'drawings'>): Promise<Drawing | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('drawings')
    .insert(drawing as any)
    .select()
    .single()

  if (error) {
    console.error('Create drawing error:', error)
    return null
  }
  return data as Drawing | null
}

export async function getDrawingByNumber(drawingNumber: string): Promise<Drawing | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('drawings')
    .select('*')
    .eq('drawing_number', drawingNumber)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Get drawing error:', error)
  }
  return data as Drawing | null
}

export async function searchDrawings(query: string): Promise<Drawing[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('drawings')
    .select('*')
    .ilike('drawing_number', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Search drawings error:', error)
    return []
  }
  return (data as Drawing[]) || []
}

// ============================================
// PIPES
// ============================================

export async function createPipe(pipe: InsertTables<'pipes'>): Promise<Pipe | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pipes')
    .insert(pipe as any)
    .select()
    .single()

  if (error) {
    console.error('Create pipe error:', error)
    return null
  }
  return data as Pipe | null
}

export async function getPipeByNumber(pipeNumber: string): Promise<Pipe | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pipes')
    .select('*, drawings(*)')
    .eq('pipe_number', pipeNumber)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Get pipe error:', error)
  }
  return data as Pipe | null
}

export async function searchPipes(query: string): Promise<any[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pipes')
    .select('*, drawings(drawing_number)')
    .ilike('pipe_number', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Search pipes error:', error)
    return []
  }
  return data || []
}

export async function getPipesByDrawing(drawingId: string): Promise<Pipe[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pipes')
    .select('*')
    .eq('drawing_id', drawingId)
    .order('pipe_number')

  if (error) {
    console.error('Get pipes by drawing error:', error)
    return []
  }
  return (data as Pipe[]) || []
}

// ============================================
// WELDS
// ============================================

export async function createWeld(weld: InsertTables<'welds'>): Promise<Weld | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('welds')
    .insert(weld as any)
    .select()
    .single()

  if (error) {
    console.error('Create weld error:', error)
    return null
  }
  return data as Weld | null
}

export async function getWeldsByPipe(pipeId: string): Promise<Weld[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('welds')
    .select('*')
    .eq('pipe_id', pipeId)
    .order('weld_number')

  if (error) {
    console.error('Get welds by pipe error:', error)
    return []
  }
  return (data as Weld[]) || []
}

export async function getWeldByNumber(pipeId: string, weldNumber: string): Promise<Weld | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('welds')
    .select('*')
    .eq('pipe_id', pipeId)
    .eq('weld_number', weldNumber)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Get weld error:', error)
  }
  return data as Weld | null
}

export async function updateWeld(id: string, updates: UpdateTables<'welds'>): Promise<Weld | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('welds')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update weld error:', error)
    return null
  }
  return data as Weld | null
}

// ============================================
// INSPECTIONS
// ============================================

export async function createInspection(
  inspection: InsertTables<'inspections'>
): Promise<Inspection | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('inspections')
    .insert(inspection as any)
    .select()
    .single()

  if (error) {
    console.error('Create inspection error:', error)
    return null
  }
  return data as Inspection | null
}

export async function getInspectionsByWeld(weldId: string): Promise<any[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('inspections')
    .select('*, operators(name)')
    .eq('weld_id', weldId)
    .order('inspection_date', { ascending: false })

  if (error) {
    console.error('Get inspections error:', error)
    return []
  }
  return data || []
}

export async function getInspectionWithDetails(inspectionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('inspections')
    .select(
      `
      *,
      operators(name, certification_level),
      welds(
        weld_number,
        weld_position,
        component_type,
        pipes(
          pipe_number,
          drawings(drawing_number)
        )
      ),
      photos(*)
    `
    )
    .eq('id', inspectionId)
    .single()

  if (error) {
    console.error('Get inspection details error:', error)
    return null
  }
  return data
}

export async function updateInspection(
  id: string,
  updates: UpdateTables<'inspections'>
): Promise<Inspection | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('inspections')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update inspection error:', error)
    return null
  }
  return data as Inspection | null
}

export interface InspectionSummary {
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

export async function getRecentInspections(limit: number = 20): Promise<InspectionSummary[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('inspection_summary')
    .select('*')
    .order('inspection_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Get recent inspections error:', error)
    return []
  }
  return (data as InspectionSummary[]) || []
}

// ============================================
// PHOTOS
// ============================================

export async function createPhoto(photo: InsertTables<'photos'>): Promise<Photo | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('photos')
    .insert(photo as any)
    .select()
    .single()

  if (error) {
    console.error('Create photo error:', error)
    return null
  }
  return data as Photo | null
}

export async function getPhotosByInspection(inspectionId: string): Promise<Photo[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('inspection_id', inspectionId)
    .order('sequence_number')

  if (error) {
    console.error('Get photos error:', error)
    return []
  }
  return (data as Photo[]) || []
}

export async function updatePhoto(id: string, updates: UpdateTables<'photos'>): Promise<Photo | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('photos')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update photo error:', error)
    return null
  }
  return data as Photo | null
}

export async function deletePhotoRecord(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('photos').delete().eq('id', id)

  if (error) {
    console.error('Delete photo error:', error)
    return false
  }
  return true
}

// ============================================
// OPERATORS
// ============================================

export async function getOperatorByUserId(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('operators')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Get operator error:', error)
  }
  return data
}

export async function getAllOperators() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('operators')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Get operators error:', error)
    return []
  }
  return data || []
}

// ============================================
// PROJECTS
// ============================================

export async function getAllProjects() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Get projects error:', error)
    return []
  }
  return data || []
}
