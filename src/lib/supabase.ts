import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Supabase 프로젝트 설정
const supabaseUrl = Constants?.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants?.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.');
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export interface Database {
  public: {
    Tables: {
      temples: {
        Row: {
          id: string;
          name: string;
          region: string;
          address: string;
          latitude: number;
          longitude: number;
          image_url: string;
          price: number;
          description: string;
          precautions: string;
          available_times: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          region: string;
          address: string;
          latitude: number;
          longitude: number;
          image_url?: string;
          price: number;
          description: string;
          precautions: string;
          available_times: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          region?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          image_url?: string;
          price?: number;
          description?: string;
          precautions?: string;
          available_times?: string[];
          updated_at?: string;
        };
      };
      temple_programs: {
        Row: {
          id: string;
          temple_id: string;
          title: string;
          description: string;
          price: number;
          times: string[];
          type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          temple_id: string;
          title: string;
          description: string;
          price: number;
          times: string[];
          type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          temple_id?: string;
          title?: string;
          description?: string;
          price?: number;
          times?: string[];
          type?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          user_id: string;
          temple_id: string;
          temple_name: string;
          program_title: string;
          reservation_date: string;
          reservation_time: string;
          participants: {
            adults: number;
            teenagers: number;
            children: number;
            preschool: number;
          };
          total_amount: number;
          payment_method: 'bank' | 'onsite';
          user_name: string;
          user_phone?: string;
          user_email: string;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          temple_id: string;
          temple_name: string;
          program_title: string;
          reservation_date: string;
          reservation_time: string;
          participants: {
            adults: number;
            teenagers: number;
            children: number;
            preschool: number;
          };
          total_amount: number;
          payment_method: 'bank' | 'onsite';
          user_name: string;
          user_phone?: string;
          user_email: string;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          temple_id?: string;
          temple_name?: string;
          program_title?: string;
          reservation_date?: string;
          reservation_time?: string;
          participants?: {
            adults?: number;
            teenagers?: number;
            children?: number;
            preschool?: number;
          };
          total_amount?: number;
          payment_method?: 'bank' | 'onsite';
          user_name?: string;
          user_phone?: string;
          user_email?: string;
          status?: 'pending' | 'confirmed' | 'cancelled';
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone_number: string;
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone_number: string;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone_number?: string;
          preferences?: any;
          updated_at?: string;
        };
      };
    };
  };
}