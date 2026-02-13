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
      candidates: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          location: string | null
          resume_url: string | null
          resume_text: string | null
          ai_score: number | null
          ai_content_score: number | null
          skills: string[] | null
          experience_years: number | null
          education: string | null
          source: string | null
          status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          location?: string | null
          resume_url?: string | null
          resume_text?: string | null
          ai_score?: number | null
          ai_content_score?: number | null
          skills?: string[] | null
          experience_years?: number | null
          education?: string | null
          source?: string | null
          status?: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          location?: string | null
          resume_url?: string | null
          resume_text?: string | null
          ai_score?: number | null
          ai_content_score?: number | null
          skills?: string[] | null
          experience_years?: number | null
          education?: string | null
          source?: string | null
          status?: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          department: string | null
          location: string | null
          type: string | null
          description: string | null
          requirements: string[] | null
          knock_out_criteria: Json[] | null
          scoring_criteria: Json[] | null
          status: 'active' | 'paused' | 'closed'
          platform_source: string | null
          external_url: string | null
          scraped_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          department?: string | null
          location?: string | null
          type?: string | null
          description?: string | null
          requirements?: string[] | null
          knock_out_criteria?: Json[] | null
          scoring_criteria?: Json[] | null
          status?: 'active' | 'paused' | 'closed'
          platform_source?: string | null
          external_url?: string | null
          scraped_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          department?: string | null
          location?: string | null
          type?: string | null
          description?: string | null
          requirements?: string[] | null
          knock_out_criteria?: Json[] | null
          scoring_criteria?: Json[] | null
          status?: 'active' | 'paused' | 'closed'
          platform_source?: string | null
          external_url?: string | null
          scraped_at?: string | null
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          candidate_id: string
          job_id: string
          status: string | null
          stage: string | null
          ai_match_score: number | null
          knock_out_results: Json | null
          scoring_results: Json | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          job_id: string
          status?: string | null
          stage?: string | null
          ai_match_score?: number | null
          knock_out_results?: Json | null
          scoring_results?: Json | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          job_id?: string
          status?: string | null
          stage?: string | null
          ai_match_score?: number | null
          knock_out_results?: Json | null
          scoring_results?: Json | null
          notes?: string | null
          created_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          application_id: string
          candidate_name: string
          role: string
          type: 'phone' | 'video' | 'onsite' | 'technical'
          date: string
          time: string
          interviewer: string | null
          status: string | null
          feedback: string | null
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          candidate_name: string
          role: string
          type: 'phone' | 'video' | 'onsite' | 'technical'
          date: string
          time: string
          interviewer?: string | null
          status?: string | null
          feedback?: string | null
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          candidate_name?: string
          role?: string
          type?: 'phone' | 'video' | 'onsite' | 'technical'
          date?: string
          time?: string
          interviewer?: string | null
          status?: string | null
          feedback?: string | null
          rating?: number | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          application_id: string | null
          template: string | null
          subject: string
          body: string
          recipients: number | null
          status: 'sent' | 'draft' | 'scheduled'
          open_rate: number | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          application_id?: string | null
          template?: string | null
          subject: string
          body: string
          recipients?: number | null
          status?: 'sent' | 'draft' | 'scheduled'
          open_rate?: number | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          application_id?: string | null
          template?: string | null
          subject?: string
          body?: string
          recipients?: number | null
          status?: 'sent' | 'draft' | 'scheduled'
          open_rate?: number | null
          sent_at?: string | null
        }
      }
      scrape_configs: {
        Row: {
          id: string
          platform: string
          base_url: string
          search_query: string | null
          selectors: Json | null
          schedule: string | null
          active: boolean
          last_run: string | null
        }
        Insert: {
          id?: string
          platform: string
          base_url: string
          search_query?: string | null
          selectors?: Json | null
          schedule?: string | null
          active?: boolean
          last_run?: string | null
        }
        Update: {
          id?: string
          platform?: string
          base_url?: string
          search_query?: string | null
          selectors?: Json | null
          schedule?: string | null
          active?: boolean
          last_run?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
