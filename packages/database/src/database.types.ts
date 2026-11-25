export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Schema types derived from audited YouMarriageWeArrange PostgreSQL 17 schema (96 active public tables
// plus prepared Migrations 02, 10, 11 additions; excludes isolated staging.photographers_import_v2).
// Refresh via Supabase CLI/MCP after prepared Migrations 01-11 are applied to live DB.
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      admins: {
        Row: {
          admin_id: number;
          user_id: string;
          admin_name: string | null;
          status: Database["public"]["Enums"]["admin_status_enum"] | null;
          created_at: string | null;
        };
        Insert: {
          admin_id?: number;
          user_id: string;
          admin_name?: string | null;
          status?: Database["public"]["Enums"]["admin_status_enum"] | null;
          created_at?: string | null;
        };
        Update: {
          admin_id?: number;
          user_id?: string;
          admin_name?: string | null;
          status?: Database["public"]["Enums"]["admin_status_enum"] | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          setting_id: number;
          setting_key: string;
          setting_value: string | null;
          description: string | null;
          data_type: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          setting_id?: number;
          setting_key: string;
          setting_value?: string | null;
          description?: string | null;
          data_type?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          setting_id?: number;
          setting_key?: string;
          setting_value?: string | null;
          description?: string | null;
          data_type?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      areas: {
        Row: {
          area_id: number;
          city_id: number;
          name: string;
          status: Database["public"]["Enums"]["status_enum"] | null;
        };
        Insert: {
          area_id?: number;
          city_id: number;
          name: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Update: {
          area_id?: number;
          city_id?: number;
          name?: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Relationships: [];
      };
      banners: {
        Row: {
          banner_id: number;
          title: string | null;
          subtitle: string | null;
          image_url: string | null;
          mobile_image_url: string | null;
          button_text: string | null;
          button_url: string | null;
          sort_order: number | null;
          status: Database["public"]["Enums"]["banner_status_enum"] | null;
          start_date: string | null;
          end_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          banner_id?: number;
          title?: string | null;
          subtitle?: string | null;
          image_url?: string | null;
          mobile_image_url?: string | null;
          button_text?: string | null;
          button_url?: string | null;
          sort_order?: number | null;
          status?: Database["public"]["Enums"]["banner_status_enum"] | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          banner_id?: number;
          title?: string | null;
          subtitle?: string | null;
          image_url?: string | null;
          mobile_image_url?: string | null;
          button_text?: string | null;
          button_url?: string | null;
          sort_order?: number | null;
          status?: Database["public"]["Enums"]["banner_status_enum"] | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      blog_categories: {
        Row: {
          category_id: number;
          category_name: string;
          slug: string | null;
          description: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          category_id?: number;
          category_name: string;
          slug?: string | null;
          description?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          category_id?: number;
          category_name?: string;
          slug?: string | null;
          description?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      blog_comments: {
        Row: {
          comment_id: number;
          blog_id: number;
          user_id: string | null;
          comment: string;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          comment_id?: number;
          blog_id: number;
          user_id?: string | null;
          comment: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          comment_id?: number;
          blog_id?: number;
          user_id?: string | null;
          comment?: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      blog_likes: {
        Row: {
          like_id: number;
          blog_id: number;
          user_id: string;
          created_at: string | null;
        };
        Insert: {
          like_id?: number;
          blog_id: number;
          user_id: string;
          created_at?: string | null;
        };
        Update: {
          like_id?: number;
          blog_id?: number;
          user_id?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      blog_tags: {
        Row: {
          tag_id: number;
          blog_id: number;
          tag_name: string;
        };
        Insert: {
          tag_id?: number;
          blog_id: number;
          tag_name: string;
        };
        Update: {
          tag_id?: number;
          blog_id?: number;
          tag_name?: string;
        };
        Relationships: [];
      };
      blogs: {
        Row: {
          blog_id: number;
          category_id: number | null;
          title: string;
          slug: string | null;
          short_description: string | null;
          content: string | null;
          featured_image: string | null;
          author_id: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          published_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          blog_id?: number;
          category_id?: number | null;
          title: string;
          slug?: string | null;
          short_description?: string | null;
          content?: string | null;
          featured_image?: string | null;
          author_id?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          published_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          blog_id?: number;
          category_id?: number | null;
          title?: string;
          slug?: string | null;
          short_description?: string | null;
          content?: string | null;
          featured_image?: string | null;
          author_id?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          published_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      booking_documents: {
        Row: {
          document_id: number;
          booking_id: number;
          document_name: string | null;
          document_url: string;
          document_type: string | null;
          created_at: string | null;
        };
        Insert: {
          document_id?: number;
          booking_id: number;
          document_name?: string | null;
          document_url: string;
          document_type?: string | null;
          created_at?: string | null;
        };
        Update: {
          document_id?: number;
          booking_id?: number;
          document_name?: string | null;
          document_url?: string;
          document_type?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      booking_payments: {
        Row: {
          booking_payment_id: number;
          booking_id: number;
          amount: number;
          payment_status: string | null;
          payment_method: string | null;
          transaction_id: string | null;
          paid_at: string | null;
          created_at: string | null;
        };
        Insert: {
          booking_payment_id?: number;
          booking_id: number;
          amount: number;
          payment_status?: string | null;
          payment_method?: string | null;
          transaction_id?: string | null;
          paid_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          booking_payment_id?: number;
          booking_id?: number;
          amount?: number;
          payment_status?: string | null;
          payment_method?: string | null;
          transaction_id?: string | null;
          paid_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      booking_status: {
        Row: {
          status_id: number;
          status_name: string;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          status_id?: number;
          status_name: string;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          status_id?: number;
          status_name?: string;
          description?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          booking_id: number;
          user_id: string | null;
          venue_id: number | null;
          vendor_id: number | null;
          status_id: number | null;
          booking_date: string | null;
          event_date: string | null;
          guest_count: number | null;
          total_amount: number | null;
          currency: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          enquiry_id: number | null;
          quote_id: number | null;
        };
        Insert: {
          booking_id?: number;
          user_id?: string | null;
          venue_id?: number | null;
          vendor_id?: number | null;
          status_id?: number | null;
          booking_date?: string | null;
          event_date?: string | null;
          guest_count?: number | null;
          total_amount?: number | null;
          currency?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          enquiry_id?: number | null;
          quote_id?: number | null;
        };
        Update: {
          booking_id?: number;
          user_id?: string | null;
          venue_id?: number | null;
          vendor_id?: number | null;
          status_id?: number | null;
          booking_date?: string | null;
          event_date?: string | null;
          guest_count?: number | null;
          total_amount?: number | null;
          currency?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          enquiry_id?: number | null;
          quote_id?: number | null;
        };
        Relationships: [];
      };
      chat_notifications: {
        Row: {
          notification_id: number;
          conversation_id: number | null;
          message_id: number | null;
          user_id: string | null;
          is_read: boolean | null;
          created_at: string | null;
        };
        Insert: {
          notification_id?: number;
          conversation_id?: number | null;
          message_id?: number | null;
          user_id?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          notification_id?: number;
          conversation_id?: number | null;
          message_id?: number | null;
          user_id?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      cities: {
        Row: {
          city_id: number;
          state_id: number;
          name: string;
          status: Database["public"]["Enums"]["status_enum"] | null;
        };
        Insert: {
          city_id?: number;
          state_id: number;
          name: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Update: {
          city_id?: number;
          state_id?: number;
          name?: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          collection_id: number;
          user_id: string;
          collection_name: string;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          collection_id?: number;
          user_id: string;
          collection_name: string;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          collection_id?: number;
          user_id?: string;
          collection_name?: string;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      comparison_sheets: {
        Row: {
          comparison_sheet_id: number;
          enquiry_id: number;
          created_by: string;
          title: string;
          quote_ids: number[];
          summary_notes: string | null;
          status: Database["public"]["Enums"]["status_enum"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          comparison_sheet_id?: number;
          enquiry_id: number;
          created_by: string;
          title: string;
          quote_ids?: number[];
          summary_notes?: string | null;
          status?: Database["public"]["Enums"]["status_enum"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          comparison_sheet_id?: number;
          enquiry_id?: number;
          created_by?: string;
          title?: string;
          quote_ids?: number[];
          summary_notes?: string | null;
          status?: Database["public"]["Enums"]["status_enum"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          conversation_id: number;
          user_id: string | null;
          vendor_id: number | null;
          venue_id: number | null;
          subject: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          conversation_id?: number;
          user_id?: string | null;
          vendor_id?: number | null;
          venue_id?: number | null;
          subject?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          conversation_id?: number;
          user_id?: string | null;
          vendor_id?: number | null;
          venue_id?: number | null;
          subject?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      countries: {
        Row: {
          country_id: number;
          name: string;
          code: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
        };
        Insert: {
          country_id?: number;
          name: string;
          code?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Update: {
          country_id?: number;
          name?: string;
          code?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          coupon_id: number;
          coupon_code: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          minimum_amount: number | null;
          maximum_discount: number | null;
          valid_from: string | null;
          valid_until: string | null;
          usage_limit: number | null;
          used_count: number | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
        };
        Insert: {
          coupon_id?: number;
          coupon_code: string;
          description?: string | null;
          discount_type: string;
          discount_value: number;
          minimum_amount?: number | null;
          maximum_discount?: number | null;
          valid_from?: string | null;
          valid_until?: string | null;
          usage_limit?: number | null;
          used_count?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
        };
        Update: {
          coupon_id?: number;
          coupon_code?: string;
          description?: string | null;
          discount_type?: string;
          discount_value?: number;
          minimum_amount?: number | null;
          maximum_discount?: number | null;
          valid_from?: string | null;
          valid_until?: string | null;
          usage_limit?: number | null;
          used_count?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      currencies: {
        Row: {
          currency_id: number;
          currency_code: string;
          currency_name: string;
          symbol: string | null;
          exchange_rate: number | null;
          is_default: boolean | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
        };
        Insert: {
          currency_id?: number;
          currency_code: string;
          currency_name: string;
          symbol?: string | null;
          exchange_rate?: number | null;
          is_default?: boolean | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
        };
        Update: {
          currency_id?: number;
          currency_code?: string;
          currency_name?: string;
          symbol?: string | null;
          exchange_rate?: number | null;
          is_default?: boolean | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      email_templates: {
        Row: {
          template_id: number;
          template_name: string;
          subject: string | null;
          body: string | null;
          variables: Json | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          template_id?: number;
          template_name: string;
          subject?: string | null;
          body?: string | null;
          variables?: Json | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          template_id?: number;
          template_name?: string;
          subject?: string | null;
          body?: string | null;
          variables?: Json | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          enquiry_id: number;
          user_id: string | null;
          venue_id: number | null;
          vendor_id: number | null;
          subject: string | null;
          message: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
          assigned_specialist_id: string | null;
          site_visit_at: string | null;
          site_visit_status: string | null;
          site_visit_notes: string | null;
        };
        Insert: {
          enquiry_id?: number;
          user_id?: string | null;
          venue_id?: number | null;
          vendor_id?: number | null;
          subject?: string | null;
          message?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
          assigned_specialist_id?: string | null;
          site_visit_at?: string | null;
          site_visit_status?: string | null;
          site_visit_notes?: string | null;
        };
        Update: {
          enquiry_id?: number;
          user_id?: string | null;
          venue_id?: number | null;
          vendor_id?: number | null;
          subject?: string | null;
          message?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
          assigned_specialist_id?: string | null;
          site_visit_at?: string | null;
          site_visit_status?: string | null;
          site_visit_notes?: string | null;
        };
        Relationships: [];
      };
      enquiry_messages: {
        Row: {
          message_id: number;
          enquiry_id: number;
          sender_id: string | null;
          message: string;
          created_at: string | null;
        };
        Insert: {
          message_id?: number;
          enquiry_id: number;
          sender_id?: string | null;
          message: string;
          created_at?: string | null;
        };
        Update: {
          message_id?: number;
          enquiry_id?: number;
          sender_id?: string | null;
          message?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      enquiry_status_history: {
        Row: {
          history_id: number;
          enquiry_id: number;
          status: Database["public"]["Enums"]["status_enum"];
          changed_by: string | null;
          remarks: string | null;
          created_at: string | null;
        };
        Insert: {
          history_id?: number;
          enquiry_id: number;
          status: Database["public"]["Enums"]["status_enum"];
          changed_by?: string | null;
          remarks?: string | null;
          created_at?: string | null;
        };
        Update: {
          history_id?: number;
          enquiry_id?: number;
          status?: Database["public"]["Enums"]["status_enum"];
          changed_by?: string | null;
          remarks?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          faq_id: number;
          question: string;
          answer: string;
          category: string | null;
          sort_order: number | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          faq_id?: number;
          question: string;
          answer: string;
          category?: string | null;
          sort_order?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          faq_id?: number;
          question?: string;
          answer?: string;
          category?: string | null;
          sort_order?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          favorite_id: number;
          user_id: string;
          venue_id: number | null;
          vendor_id: number | null;
          inspiration_id: number | null;
          blog_id: number | null;
          created_at: string | null;
          collection_id: number | null;
        };
        Insert: {
          favorite_id?: number;
          user_id: string;
          venue_id?: number | null;
          vendor_id?: number | null;
          inspiration_id?: number | null;
          blog_id?: number | null;
          created_at?: string | null;
          collection_id?: number | null;
        };
        Update: {
          favorite_id?: number;
          user_id?: string;
          venue_id?: number | null;
          vendor_id?: number | null;
          inspiration_id?: number | null;
          blog_id?: number | null;
          created_at?: string | null;
          collection_id?: number | null;
        };
        Relationships: [];
      };
      home_sections: {
        Row: {
          section_id: number;
          section_name: string;
          section_type: string | null;
          title: string | null;
          description: string | null;
          content: Json | null;
          sort_order: number | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          section_id?: number;
          section_name: string;
          section_type?: string | null;
          title?: string | null;
          description?: string | null;
          content?: Json | null;
          sort_order?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          section_id?: number;
          section_name?: string;
          section_type?: string | null;
          title?: string | null;
          description?: string | null;
          content?: Json | null;
          sort_order?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      inspiration_categories: {
        Row: {
          category_id: number;
          category_name: string;
          slug: string | null;
          description: string | null;
          sort_order: number | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          category_id?: number;
          category_name: string;
          slug?: string | null;
          description?: string | null;
          sort_order?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          category_id?: number;
          category_name?: string;
          slug?: string | null;
          description?: string | null;
          sort_order?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      inspiration_gallery: {
        Row: {
          gallery_id: number;
          inspiration_id: number;
          media_type: string | null;
          media_url: string;
          is_cover: boolean | null;
          sort_order: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          gallery_id?: number;
          inspiration_id: number;
          media_type?: string | null;
          media_url: string;
          is_cover?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          gallery_id?: number;
          inspiration_id?: number;
          media_type?: string | null;
          media_url?: string;
          is_cover?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      inspirations: {
        Row: {
          inspiration_id: number;
          category_id: number;
          title: string;
          description: string | null;
          image_url: string | null;
          video_url: string | null;
          created_by: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          inspiration_id?: number;
          category_id: number;
          title: string;
          description?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          created_by?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          inspiration_id?: number;
          category_id?: number;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          created_by?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      invite_guests: {
        Row: {
          guest_id: number;
          invite_id: number;
          guest_name: string;
          phone: string | null;
          email: string | null;
          relationship: string | null;
          invitation_status: string | null;
          created_at: string | null;
        };
        Insert: {
          guest_id?: number;
          invite_id: number;
          guest_name: string;
          phone?: string | null;
          email?: string | null;
          relationship?: string | null;
          invitation_status?: string | null;
          created_at?: string | null;
        };
        Update: {
          guest_id?: number;
          invite_id?: number;
          guest_name?: string;
          phone?: string | null;
          email?: string | null;
          relationship?: string | null;
          invitation_status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      invite_media: {
        Row: {
          media_id: number;
          invite_id: number;
          media_type: string | null;
          media_url: string;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: {
          media_id?: number;
          invite_id: number;
          media_type?: string | null;
          media_url: string;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Update: {
          media_id?: number;
          invite_id?: number;
          media_type?: string | null;
          media_url?: string;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      invite_rsvp: {
        Row: {
          rsvp_id: number;
          guest_id: number;
          response: string;
          guest_count: number | null;
          message: string | null;
          responded_at: string | null;
        };
        Insert: {
          rsvp_id?: number;
          guest_id: number;
          response: string;
          guest_count?: number | null;
          message?: string | null;
          responded_at?: string | null;
        };
        Update: {
          rsvp_id?: number;
          guest_id?: number;
          response?: string;
          guest_count?: number | null;
          message?: string | null;
          responded_at?: string | null;
        };
        Relationships: [];
      };
      invite_templates: {
        Row: {
          template_id: number;
          template_name: string;
          description: string | null;
          preview_image: string | null;
          template_url: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          template_id?: number;
          template_name: string;
          description?: string | null;
          preview_image?: string | null;
          template_url?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          template_id?: number;
          template_name?: string;
          description?: string | null;
          preview_image?: string | null;
          template_url?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      invites: {
        Row: {
          invite_id: number;
          user_id: string | null;
          template_id: number | null;
          title: string | null;
          slug: string | null;
          bride_name: string | null;
          groom_name: string | null;
          event_date: string | null;
          event_time: string | null;
          venue_name: string | null;
          venue_address: string | null;
          message: string | null;
          cover_image: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          invite_id?: number;
          user_id?: string | null;
          template_id?: number | null;
          title?: string | null;
          slug?: string | null;
          bride_name?: string | null;
          groom_name?: string | null;
          event_date?: string | null;
          event_time?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          message?: string | null;
          cover_image?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          invite_id?: number;
          user_id?: string | null;
          template_id?: number | null;
          title?: string | null;
          slug?: string | null;
          bride_name?: string | null;
          groom_name?: string | null;
          event_date?: string | null;
          event_time?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          message?: string | null;
          cover_image?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          invoice_id: number;
          payment_id: number | null;
          user_id: string | null;
          invoice_number: string;
          amount: number;
          tax_amount: number | null;
          total_amount: number;
          currency: string | null;
          invoice_url: string | null;
          issued_at: string | null;
        };
        Insert: {
          invoice_id?: number;
          payment_id?: number | null;
          user_id?: string | null;
          invoice_number: string;
          amount: number;
          tax_amount?: number | null;
          total_amount: number;
          currency?: string | null;
          invoice_url?: string | null;
          issued_at?: string | null;
        };
        Update: {
          invoice_id?: number;
          payment_id?: number | null;
          user_id?: string | null;
          invoice_number?: string;
          amount?: number;
          tax_amount?: number | null;
          total_amount?: number;
          currency?: string | null;
          invoice_url?: string | null;
          issued_at?: string | null;
        };
        Relationships: [];
      };
      languages: {
        Row: {
          language_id: number;
          language_code: string;
          language_name: string;
          native_name: string | null;
          is_default: boolean | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
        };
        Insert: {
          language_id?: number;
          language_code: string;
          language_name: string;
          native_name?: string | null;
          is_default?: boolean | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
        };
        Update: {
          language_id?: number;
          language_code?: string;
          language_name?: string;
          native_name?: string | null;
          is_default?: boolean | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      localities: {
        Row: {
          locality_id: number;
          area_id: number;
          name: string;
          status: Database["public"]["Enums"]["status_enum"] | null;
        };
        Insert: {
          locality_id?: number;
          area_id: number;
          name: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Update: {
          locality_id?: number;
          area_id?: number;
          name?: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Relationships: [];
      };
      message_attachments: {
        Row: {
          attachment_id: number;
          message_id: number;
          file_name: string | null;
          file_url: string;
          file_type: string | null;
          file_size: number | null;
          created_at: string | null;
        };
        Insert: {
          attachment_id?: number;
          message_id: number;
          file_name?: string | null;
          file_url: string;
          file_type?: string | null;
          file_size?: number | null;
          created_at?: string | null;
        };
        Update: {
          attachment_id?: number;
          message_id?: number;
          file_name?: string | null;
          file_url?: string;
          file_type?: string | null;
          file_size?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          message_id: number;
          conversation_id: number;
          sender_id: string | null;
          message: string | null;
          message_type: string | null;
          is_read: boolean | null;
          created_at: string | null;
        };
        Insert: {
          message_id?: number;
          conversation_id: number;
          sender_id?: string | null;
          message?: string | null;
          message_type?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          message_id?: number;
          conversation_id?: number;
          sender_id?: string | null;
          message?: string | null;
          message_type?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      moderation_logs: {
        Row: {
          log_id: number;
          report_id: number | null;
          moderator_id: string | null;
          action: string;
          remarks: string | null;
          created_at: string | null;
        };
        Insert: {
          log_id?: number;
          report_id?: number | null;
          moderator_id?: string | null;
          action: string;
          remarks?: string | null;
          created_at?: string | null;
        };
        Update: {
          log_id?: number;
          report_id?: number | null;
          moderator_id?: string | null;
          action?: string;
          remarks?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      notification_logs: {
        Row: {
          log_id: number;
          notification_id: number | null;
          user_id: string | null;
          channel: string | null;
          delivery_status: string | null;
          provider_response: Json | null;
          sent_at: string | null;
          created_at: string | null;
        };
        Insert: {
          log_id?: number;
          notification_id?: number | null;
          user_id?: string | null;
          channel?: string | null;
          delivery_status?: string | null;
          provider_response?: Json | null;
          sent_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          log_id?: number;
          notification_id?: number | null;
          user_id?: string | null;
          channel?: string | null;
          delivery_status?: string | null;
          provider_response?: Json | null;
          sent_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      notification_templates: {
        Row: {
          template_id: number;
          template_name: string;
          title_template: string | null;
          message_template: string | null;
          notification_type: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          template_id?: number;
          template_name: string;
          title_template?: string | null;
          message_template?: string | null;
          notification_type?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          template_id?: number;
          template_name?: string;
          title_template?: string | null;
          message_template?: string | null;
          notification_type?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          notification_id: number;
          user_id: string | null;
          template_id: number | null;
          title: string;
          message: string;
          notification_type: string | null;
          is_read: boolean | null;
          read_at: string | null;
          created_at: string | null;
        };
        Insert: {
          notification_id?: number;
          user_id?: string | null;
          template_id?: number | null;
          title: string;
          message: string;
          notification_type?: string | null;
          is_read?: boolean | null;
          read_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          notification_id?: number;
          user_id?: string | null;
          template_id?: number | null;
          title?: string;
          message?: string;
          notification_type?: string | null;
          is_read?: boolean | null;
          read_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          page_id: number;
          page_name: string;
          slug: string;
          title: string | null;
          content: string | null;
          featured_image: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          page_id?: number;
          page_name: string;
          slug: string;
          title?: string | null;
          content?: string | null;
          featured_image?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          page_id?: number;
          page_name?: string;
          slug?: string;
          title?: string | null;
          content?: string | null;
          featured_image?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          payment_id: number;
          user_id: string | null;
          booking_id: number | null;
          amount: number;
          currency: string | null;
          payment_method: string | null;
          payment_status: string | null;
          transaction_id: string | null;
          paid_at: string | null;
          created_at: string | null;
          idempotency_key: string | null;
        };
        Insert: {
          payment_id?: number;
          user_id?: string | null;
          booking_id?: number | null;
          amount: number;
          currency?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          transaction_id?: string | null;
          paid_at?: string | null;
          created_at?: string | null;
          idempotency_key?: string | null;
        };
        Update: {
          payment_id?: number;
          user_id?: string | null;
          booking_id?: number | null;
          amount?: number;
          currency?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          transaction_id?: string | null;
          paid_at?: string | null;
          created_at?: string | null;
          idempotency_key?: string | null;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          permission_id: number;
          permission_name: string;
          module: string | null;
          created_at: string | null;
        };
        Insert: {
          permission_id?: number;
          permission_name: string;
          module?: string | null;
          created_at?: string | null;
        };
        Update: {
          permission_id?: number;
          permission_name?: string;
          module?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      popular_searches: {
        Row: {
          popular_search_id: number;
          search_query: string;
          search_type: string | null;
          search_count: number | null;
          last_searched_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          popular_search_id?: number;
          search_query: string;
          search_type?: string | null;
          search_count?: number | null;
          last_searched_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          popular_search_id?: number;
          search_query?: string;
          search_type?: string | null;
          search_count?: number | null;
          last_searched_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          quote_id: number;
          enquiry_id: number;
          venue_id: number | null;
          vendor_id: number | null;
          collected_by: string;
          package_name: string;
          base_cost_inr: number;
          currency: string;
          catering_included: boolean;
          inclusions: Json;
          exclusions: Json;
          notes: string | null;
          valid_until: string | null;
          status: Database["public"]["Enums"]["status_enum"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          quote_id?: number;
          enquiry_id: number;
          venue_id?: number | null;
          vendor_id?: number | null;
          collected_by: string;
          package_name: string;
          base_cost_inr: number;
          currency?: string;
          catering_included?: boolean;
          inclusions?: Json;
          exclusions?: Json;
          notes?: string | null;
          valid_until?: string | null;
          status?: Database["public"]["Enums"]["status_enum"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          quote_id?: number;
          enquiry_id?: number;
          venue_id?: number | null;
          vendor_id?: number | null;
          collected_by?: string;
          package_name?: string;
          base_cost_inr?: number;
          currency?: string;
          catering_included?: boolean;
          inclusions?: Json;
          exclusions?: Json;
          notes?: string | null;
          valid_until?: string | null;
          status?: Database["public"]["Enums"]["status_enum"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      real_weddings: {
        Row: {
          wedding_id: number;
          title: string;
          description: string | null;
          wedding_date: string | null;
          city_id: number | null;
          cover_image: string | null;
          created_by: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          wedding_id?: number;
          title: string;
          description?: string | null;
          wedding_date?: string | null;
          city_id?: number | null;
          cover_image?: string | null;
          created_by?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          wedding_id?: number;
          title?: string;
          description?: string | null;
          wedding_date?: string | null;
          city_id?: number | null;
          cover_image?: string | null;
          created_by?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      recent_searches: {
        Row: {
          search_id: number;
          user_id: string | null;
          search_query: string;
          search_type: string | null;
          created_at: string | null;
        };
        Insert: {
          search_id?: number;
          user_id?: string | null;
          search_query: string;
          search_type?: string | null;
          created_at?: string | null;
        };
        Update: {
          search_id?: number;
          user_id?: string | null;
          search_query?: string;
          search_type?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      refunds: {
        Row: {
          refund_id: number;
          payment_id: number;
          amount: number;
          reason: string | null;
          refund_status: string | null;
          refund_transaction_id: string | null;
          refunded_at: string | null;
          created_at: string | null;
        };
        Insert: {
          refund_id?: number;
          payment_id: number;
          amount: number;
          reason?: string | null;
          refund_status?: string | null;
          refund_transaction_id?: string | null;
          refunded_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          refund_id?: number;
          payment_id?: number;
          amount?: number;
          reason?: string | null;
          refund_status?: string | null;
          refund_transaction_id?: string | null;
          refunded_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      report_reasons: {
        Row: {
          reason_id: number;
          reason_name: string;
          description: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
        };
        Insert: {
          reason_id?: number;
          reason_name: string;
          description?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
        };
        Update: {
          reason_id?: number;
          reason_name?: string;
          description?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          report_id: number;
          reporter_id: string | null;
          reason_id: number | null;
          reported_user_id: string | null;
          venue_id: number | null;
          vendor_id: number | null;
          review_id: number | null;
          blog_id: number | null;
          description: string | null;
          status: Database["public"]["Enums"]["report_status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          report_id?: number;
          reporter_id?: string | null;
          reason_id?: number | null;
          reported_user_id?: string | null;
          venue_id?: number | null;
          vendor_id?: number | null;
          review_id?: number | null;
          blog_id?: number | null;
          description?: string | null;
          status?: Database["public"]["Enums"]["report_status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          report_id?: number;
          reporter_id?: string | null;
          reason_id?: number | null;
          reported_user_id?: string | null;
          venue_id?: number | null;
          vendor_id?: number | null;
          review_id?: number | null;
          blog_id?: number | null;
          description?: string | null;
          status?: Database["public"]["Enums"]["report_status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      review_images: {
        Row: {
          image_id: number;
          review_id: number;
          image_url: string;
          created_at: string | null;
        };
        Insert: {
          image_id?: number;
          review_id: number;
          image_url: string;
          created_at?: string | null;
        };
        Update: {
          image_id?: number;
          review_id?: number;
          image_url?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      review_votes: {
        Row: {
          vote_id: number;
          review_id: number;
          user_id: string;
          vote_type: string;
          created_at: string | null;
        };
        Insert: {
          vote_id?: number;
          review_id: number;
          user_id: string;
          vote_type: string;
          created_at?: string | null;
        };
        Update: {
          vote_id?: number;
          review_id?: number;
          user_id?: string;
          vote_type?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          review_id: number;
          user_id: string | null;
          venue_id: number | null;
          vendor_id: number | null;
          rating: number;
          review_text: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          review_id?: number;
          user_id?: string | null;
          venue_id?: number | null;
          vendor_id?: number | null;
          rating: number;
          review_text?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          review_id?: number;
          user_id?: string | null;
          venue_id?: number | null;
          vendor_id?: number | null;
          rating?: number;
          review_text?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          role_id: number;
          permission_id: number;
        };
        Insert: {
          role_id: number;
          permission_id: number;
        };
        Update: {
          role_id?: number;
          permission_id?: number;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          role_id: number;
          role_name: string;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
        };
        Insert: {
          role_id?: number;
          role_name: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
        };
        Update: {
          role_id?: number;
          role_name?: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      search_filters: {
        Row: {
          filter_id: number;
          user_id: string | null;
          filter_name: string | null;
          filter_data: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          filter_id?: number;
          user_id?: string | null;
          filter_name?: string | null;
          filter_data?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          filter_id?: number;
          user_id?: string | null;
          filter_name?: string | null;
          filter_data?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      seo: {
        Row: {
          seo_id: number;
          page_id: number | null;
          meta_title: string | null;
          meta_description: string | null;
          meta_keywords: string | null;
          canonical_url: string | null;
          og_title: string | null;
          og_description: string | null;
          og_image: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          seo_id?: number;
          page_id?: number | null;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string | null;
          canonical_url?: string | null;
          og_title?: string | null;
          og_description?: string | null;
          og_image?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          seo_id?: number;
          page_id?: number | null;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string | null;
          canonical_url?: string | null;
          og_title?: string | null;
          og_description?: string | null;
          og_image?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      sms_templates: {
        Row: {
          template_id: number;
          template_name: string;
          message: string;
          variables: Json | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          template_id?: number;
          template_name: string;
          message: string;
          variables?: Json | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          template_id?: number;
          template_name?: string;
          message?: string;
          variables?: Json | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      states: {
        Row: {
          state_id: number;
          country_id: number;
          name: string;
          status: Database["public"]["Enums"]["status_enum"] | null;
        };
        Insert: {
          state_id?: number;
          country_id: number;
          name: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Update: {
          state_id?: number;
          country_id?: number;
          name?: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          testimonial_id: number;
          name: string;
          designation: string | null;
          message: string;
          image_url: string | null;
          rating: number | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          sort_order: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          testimonial_id?: number;
          name: string;
          designation?: string | null;
          message: string;
          image_url?: string | null;
          rating?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          testimonial_id?: number;
          name?: string;
          designation?: string | null;
          message?: string;
          image_url?: string | null;
          rating?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      themes: {
        Row: {
          theme_id: number;
          theme_name: string;
          description: string | null;
          theme_config: Json | null;
          is_default: boolean | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          theme_id?: number;
          theme_name: string;
          description?: string | null;
          theme_config?: Json | null;
          is_default?: boolean | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          theme_id?: number;
          theme_name?: string;
          description?: string | null;
          theme_config?: Json | null;
          is_default?: boolean | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          transaction_id: number;
          payment_id: number | null;
          user_id: string | null;
          transaction_reference: string | null;
          transaction_type: string | null;
          amount: number;
          currency: string | null;
          transaction_status: string | null;
          gateway: string | null;
          gateway_response: Json | null;
          created_at: string | null;
        };
        Insert: {
          transaction_id?: number;
          payment_id?: number | null;
          user_id?: string | null;
          transaction_reference?: string | null;
          transaction_type?: string | null;
          amount: number;
          currency?: string | null;
          transaction_status?: string | null;
          gateway?: string | null;
          gateway_response?: Json | null;
          created_at?: string | null;
        };
        Update: {
          transaction_id?: number;
          payment_id?: number | null;
          user_id?: string | null;
          transaction_reference?: string | null;
          transaction_type?: string | null;
          amount?: number;
          currency?: string | null;
          transaction_status?: string | null;
          gateway?: string | null;
          gateway_response?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      user_profile: {
        Row: {
          profile_id: number;
          user_id: string;
          address: string | null;
          city_id: number | null;
          area_id: number | null;
          pincode: string | null;
          about: string | null;
          gender: string | null;
          dob: string | null;
          profile_image: string | null;
          created_at: string | null;
          updated_at: string | null;
          preferences: Json;
        };
        Insert: {
          profile_id?: number;
          user_id: string;
          address?: string | null;
          city_id?: number | null;
          area_id?: number | null;
          pincode?: string | null;
          about?: string | null;
          gender?: string | null;
          dob?: string | null;
          profile_image?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          preferences?: Json;
        };
        Update: {
          profile_id?: number;
          user_id?: string;
          address?: string | null;
          city_id?: number | null;
          area_id?: number | null;
          pincode?: string | null;
          about?: string | null;
          gender?: string | null;
          dob?: string | null;
          profile_image?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          preferences?: Json;
        };
        Relationships: [];
      };
      users: {
        Row: {
          user_id: string;
          role_id: number | null;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          role_id?: number | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          role_id?: number | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      vendor_availability: {
        Row: {
          availability_id: number;
          vendor_id: number;
          available_from: string | null;
          available_to: string | null;
          is_booked: boolean | null;
        };
        Insert: {
          availability_id?: number;
          vendor_id: number;
          available_from?: string | null;
          available_to?: string | null;
          is_booked?: boolean | null;
        };
        Update: {
          availability_id?: number;
          vendor_id?: number;
          available_from?: string | null;
          available_to?: string | null;
          is_booked?: boolean | null;
        };
        Relationships: [];
      };
      vendor_categories: {
        Row: {
          category_id: number;
          category_name: string;
          slug: string | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
        };
        Insert: {
          category_id?: number;
          category_name: string;
          slug?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Update: {
          category_id?: number;
          category_name?: string;
          slug?: string | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Relationships: [];
      };
      vendor_contacts: {
        Row: {
          contact_id: number;
          vendor_id: number;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
        };
        Insert: {
          contact_id?: number;
          vendor_id: number;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
        };
        Update: {
          contact_id?: number;
          vendor_id?: number;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
        };
        Relationships: [];
      };
      vendor_faq: {
        Row: {
          faq_id: number;
          vendor_id: number;
          question: string | null;
          answer: string | null;
          sort_order: number | null;
        };
        Insert: {
          faq_id?: number;
          vendor_id: number;
          question?: string | null;
          answer?: string | null;
          sort_order?: number | null;
        };
        Update: {
          faq_id?: number;
          vendor_id?: number;
          question?: string | null;
          answer?: string | null;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      vendor_gallery: {
        Row: {
          gallery_id: number;
          vendor_id: number;
          media_type: string | null;
          media_url: string;
          is_cover: boolean | null;
          sort_order: number | null;
        };
        Insert: {
          gallery_id?: number;
          vendor_id: number;
          media_type?: string | null;
          media_url: string;
          is_cover?: boolean | null;
          sort_order?: number | null;
        };
        Update: {
          gallery_id?: number;
          vendor_id?: number;
          media_type?: string | null;
          media_url?: string;
          is_cover?: boolean | null;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      vendor_packages: {
        Row: {
          package_id: number;
          vendor_id: number;
          package_name: string;
          description: string | null;
          price: number | null;
          currency: string | null;
        };
        Insert: {
          package_id?: number;
          vendor_id: number;
          package_name: string;
          description?: string | null;
          price?: number | null;
          currency?: string | null;
        };
        Update: {
          package_id?: number;
          vendor_id?: number;
          package_name?: string;
          description?: string | null;
          price?: number | null;
          currency?: string | null;
        };
        Relationships: [];
      };
      vendor_pricing: {
        Row: {
          pricing_id: number;
          vendor_id: number;
          service_name: string | null;
          price: number | null;
          price_unit: string | null;
          currency: string | null;
        };
        Insert: {
          pricing_id?: number;
          vendor_id: number;
          service_name?: string | null;
          price?: number | null;
          price_unit?: string | null;
          currency?: string | null;
        };
        Update: {
          pricing_id?: number;
          vendor_id?: number;
          service_name?: string | null;
          price?: number | null;
          price_unit?: string | null;
          currency?: string | null;
        };
        Relationships: [];
      };
      vendor_services: {
        Row: {
          service_id: number;
          vendor_id: number;
          service_name: string;
          description: string | null;
        };
        Insert: {
          service_id?: number;
          vendor_id: number;
          service_name: string;
          description?: string | null;
        };
        Update: {
          service_id?: number;
          vendor_id?: number;
          service_name?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      vendor_social_links: {
        Row: {
          social_id: number;
          vendor_id: number;
          platform: string | null;
          url: string | null;
        };
        Insert: {
          social_id?: number;
          vendor_id: number;
          platform?: string | null;
          url?: string | null;
        };
        Update: {
          social_id?: number;
          vendor_id?: number;
          platform?: string | null;
          url?: string | null;
        };
        Relationships: [];
      };
      vendor_team: {
        Row: {
          team_id: number;
          vendor_id: number;
          name: string | null;
          role: string | null;
          photo: string | null;
        };
        Insert: {
          team_id?: number;
          vendor_id: number;
          name?: string | null;
          role?: string | null;
          photo?: string | null;
        };
        Update: {
          team_id?: number;
          vendor_id?: number;
          name?: string | null;
          role?: string | null;
          photo?: string | null;
        };
        Relationships: [];
      };
      vendor_videos: {
        Row: {
          video_id: number;
          vendor_id: number;
          video_url: string;
          title: string | null;
          sort_order: number | null;
        };
        Insert: {
          video_id?: number;
          vendor_id: number;
          video_url: string;
          title?: string | null;
          sort_order?: number | null;
        };
        Update: {
          video_id?: number;
          vendor_id?: number;
          video_url?: string;
          title?: string | null;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      vendors: {
        Row: {
          vendor_id: number;
          category_id: number | null;
          user_id: string | null;
          vendor_name: string;
          slug: string | null;
          description: string | null;
          logo: string | null;
          cover_image: string | null;
          rating: number | null;
          is_verified: boolean | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          updated_at: string | null;
          metadata: Json | null;
        };
        Insert: {
          vendor_id?: number;
          category_id?: number | null;
          user_id?: string | null;
          vendor_name: string;
          slug?: string | null;
          description?: string | null;
          logo?: string | null;
          cover_image?: string | null;
          rating?: number | null;
          is_verified?: boolean | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          vendor_id?: number;
          category_id?: number | null;
          user_id?: string | null;
          vendor_name?: string;
          slug?: string | null;
          description?: string | null;
          logo?: string | null;
          cover_image?: string | null;
          rating?: number | null;
          is_verified?: boolean | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          updated_at?: string | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      venue_amenities: {
        Row: {
          amenity_id: number;
          venue_id: number;
          amenity_name: string;
        };
        Insert: {
          amenity_id?: number;
          venue_id: number;
          amenity_name: string;
        };
        Update: {
          amenity_id?: number;
          venue_id?: number;
          amenity_name?: string;
        };
        Relationships: [];
      };
      venue_availability: {
        Row: {
          availability_id: number;
          venue_id: number;
          available_from: string | null;
          available_to: string | null;
          is_booked: boolean | null;
        };
        Insert: {
          availability_id?: number;
          venue_id: number;
          available_from?: string | null;
          available_to?: string | null;
          is_booked?: boolean | null;
        };
        Update: {
          availability_id?: number;
          venue_id?: number;
          available_from?: string | null;
          available_to?: string | null;
          is_booked?: boolean | null;
        };
        Relationships: [];
      };
      venue_contacts: {
        Row: {
          contact_id: number;
          venue_id: number;
          phone: string | null;
          whatsapp_available: boolean | null;
          website: string | null;
          google_maps: string | null;
        };
        Insert: {
          contact_id?: number;
          venue_id: number;
          phone?: string | null;
          whatsapp_available?: boolean | null;
          website?: string | null;
          google_maps?: string | null;
        };
        Update: {
          contact_id?: number;
          venue_id?: number;
          phone?: string | null;
          whatsapp_available?: boolean | null;
          website?: string | null;
          google_maps?: string | null;
        };
        Relationships: [];
      };
      venue_faq: {
        Row: {
          faq_id: number;
          venue_id: number;
          question: string | null;
          answer: string | null;
        };
        Insert: {
          faq_id?: number;
          venue_id: number;
          question?: string | null;
          answer?: string | null;
        };
        Update: {
          faq_id?: number;
          venue_id?: number;
          question?: string | null;
          answer?: string | null;
        };
        Relationships: [];
      };
      venue_features: {
        Row: {
          feature_id: number;
          venue_id: number;
          feature_name: string;
        };
        Insert: {
          feature_id?: number;
          venue_id: number;
          feature_name: string;
        };
        Update: {
          feature_id?: number;
          venue_id?: number;
          feature_name?: string;
        };
        Relationships: [];
      };
      venue_gallery: {
        Row: {
          gallery_id: number;
          venue_id: number;
          media_type: string | null;
          media_url: string;
          is_cover: boolean | null;
          sort_order: number | null;
        };
        Insert: {
          gallery_id?: number;
          venue_id: number;
          media_type?: string | null;
          media_url: string;
          is_cover?: boolean | null;
          sort_order?: number | null;
        };
        Update: {
          gallery_id?: number;
          venue_id?: number;
          media_type?: string | null;
          media_url?: string;
          is_cover?: boolean | null;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      venue_menus: {
        Row: {
          menu_id: number;
          venue_id: number;
          menu_name: string | null;
          menu_url: string | null;
          veg_price: number | null;
          non_veg_price: number | null;
          cuisines: string | null;
          outside_catering: boolean | null;
          alcohol_policy: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          menu_id: number;
          venue_id: number;
          menu_name?: string | null;
          menu_url?: string | null;
          veg_price?: number | null;
          non_veg_price?: number | null;
          cuisines?: string | null;
          outside_catering?: boolean | null;
          alcohol_policy?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          menu_id?: number;
          venue_id?: number;
          menu_name?: string | null;
          menu_url?: string | null;
          veg_price?: number | null;
          non_veg_price?: number | null;
          cuisines?: string | null;
          outside_catering?: boolean | null;
          alcohol_policy?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      venue_packages: {
        Row: {
          package_id: number;
          venue_id: number;
          package_name: string;
          description: string | null;
          price: number | null;
          capacity: number | null;
        };
        Insert: {
          package_id?: number;
          venue_id: number;
          package_name: string;
          description?: string | null;
          price?: number | null;
          capacity?: number | null;
        };
        Update: {
          package_id?: number;
          venue_id?: number;
          package_name?: string;
          description?: string | null;
          price?: number | null;
          capacity?: number | null;
        };
        Relationships: [];
      };
      venue_parking: {
        Row: {
          parking_id: number;
          venue_id: number;
          available: boolean | null;
          parking_details: string | null;
        };
        Insert: {
          parking_id?: number;
          venue_id: number;
          available?: boolean | null;
          parking_details?: string | null;
        };
        Update: {
          parking_id?: number;
          venue_id?: number;
          available?: boolean | null;
          parking_details?: string | null;
        };
        Relationships: [];
      };
      venue_pricing: {
        Row: {
          pricing_id: number;
          venue_id: number;
          starting_price: number | null;
          veg_price: number | null;
          non_veg_price: number | null;
          rental_cost: number | null;
          currency: string | null;
          price_tag: string | null;
          price_subtext: string | null;
        };
        Insert: {
          pricing_id?: number;
          venue_id: number;
          starting_price?: number | null;
          veg_price?: number | null;
          non_veg_price?: number | null;
          rental_cost?: number | null;
          currency?: string | null;
          price_tag?: string | null;
          price_subtext?: string | null;
        };
        Update: {
          pricing_id?: number;
          venue_id?: number;
          starting_price?: number | null;
          veg_price?: number | null;
          non_veg_price?: number | null;
          rental_cost?: number | null;
          currency?: string | null;
          price_tag?: string | null;
          price_subtext?: string | null;
        };
        Relationships: [];
      };
      venue_room_details: {
        Row: {
          room_id: number;
          venue_id: number;
          number_of_rooms: number | null;
          room_description: string | null;
        };
        Insert: {
          room_id?: number;
          venue_id: number;
          number_of_rooms?: number | null;
          room_description?: string | null;
        };
        Update: {
          room_id?: number;
          venue_id?: number;
          number_of_rooms?: number | null;
          room_description?: string | null;
        };
        Relationships: [];
      };
      venue_types: {
        Row: {
          type_id: number;
          type_name: string;
          status: Database["public"]["Enums"]["status_enum"] | null;
        };
        Insert: {
          type_id?: number;
          type_name: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Update: {
          type_id?: number;
          type_name?: string;
          status?: Database["public"]["Enums"]["status_enum"] | null;
        };
        Relationships: [];
      };
      venue_videos: {
        Row: {
          video_id: number;
          venue_id: number;
          video_url: string;
          title: string | null;
          sort_order: number | null;
        };
        Insert: {
          video_id?: number;
          venue_id: number;
          video_url: string;
          title?: string | null;
          sort_order?: number | null;
        };
        Update: {
          video_id?: number;
          venue_id?: number;
          video_url?: string;
          title?: string | null;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      venues: {
        Row: {
          venue_id: number;
          type_id: number;
          venue_name: string;
          description: string | null;
          area_id: number | null;
          address: string | null;
          rating: number | null;
          price_range: string | null;
          capacity: number | null;
          status: Database["public"]["Enums"]["status_enum"] | null;
          created_at: string | null;
          external_id: number | null;
          member_id: number | null;
          membership_id: number | null;
          source_url: string | null;
          locality_name: string | null;
          primary_locality: string | null;
          base_city: string | null;
          pincode: string | null;
          short_summary: string | null;
          about_venue: string | null;
          reviews_count: number | null;
          best_rating: number | null;
          worst_rating: number | null;
          price_subtext: string | null;
          currency: string | null;
          venue_price_tag: string | null;
          min_plate_price: number | null;
          max_plate_price: number | null;
          category_price_suffix_text: string | null;
          destination_price: string | null;
          destination_price_unit: string | null;
          guest_count_min: number | null;
          guest_count_max: number | null;
          indoor_outdoor_spaces: string | null;
          catering_policy: string | null;
          decor_policy: string | null;
          availability_start_time: string | null;
          availability_end_time: string | null;
          phone: string | null;
          website: string | null;
          google_maps: string | null;
          features: Json | null;
          rules_policies: Json | null;
          slug: string;
        };
        Insert: {
          venue_id?: number;
          type_id: number;
          venue_name: string;
          description?: string | null;
          area_id?: number | null;
          address?: string | null;
          rating?: number | null;
          price_range?: string | null;
          capacity?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          external_id?: number | null;
          member_id?: number | null;
          membership_id?: number | null;
          source_url?: string | null;
          locality_name?: string | null;
          primary_locality?: string | null;
          base_city?: string | null;
          pincode?: string | null;
          short_summary?: string | null;
          about_venue?: string | null;
          reviews_count?: number | null;
          best_rating?: number | null;
          worst_rating?: number | null;
          price_subtext?: string | null;
          currency?: string | null;
          venue_price_tag?: string | null;
          min_plate_price?: number | null;
          max_plate_price?: number | null;
          category_price_suffix_text?: string | null;
          destination_price?: string | null;
          destination_price_unit?: string | null;
          guest_count_min?: number | null;
          guest_count_max?: number | null;
          indoor_outdoor_spaces?: string | null;
          catering_policy?: string | null;
          decor_policy?: string | null;
          availability_start_time?: string | null;
          availability_end_time?: string | null;
          phone?: string | null;
          website?: string | null;
          google_maps?: string | null;
          features?: Json | null;
          rules_policies?: Json | null;
          slug: string;
        };
        Update: {
          venue_id?: number;
          type_id?: number;
          venue_name?: string;
          description?: string | null;
          area_id?: number | null;
          address?: string | null;
          rating?: number | null;
          price_range?: string | null;
          capacity?: number | null;
          status?: Database["public"]["Enums"]["status_enum"] | null;
          created_at?: string | null;
          external_id?: number | null;
          member_id?: number | null;
          membership_id?: number | null;
          source_url?: string | null;
          locality_name?: string | null;
          primary_locality?: string | null;
          base_city?: string | null;
          pincode?: string | null;
          short_summary?: string | null;
          about_venue?: string | null;
          reviews_count?: number | null;
          best_rating?: number | null;
          worst_rating?: number | null;
          price_subtext?: string | null;
          currency?: string | null;
          venue_price_tag?: string | null;
          min_plate_price?: number | null;
          max_plate_price?: number | null;
          category_price_suffix_text?: string | null;
          destination_price?: string | null;
          destination_price_unit?: string | null;
          guest_count_min?: number | null;
          guest_count_max?: number | null;
          indoor_outdoor_spaces?: string | null;
          catering_policy?: string | null;
          decor_policy?: string | null;
          availability_start_time?: string | null;
          availability_end_time?: string | null;
          phone?: string | null;
          website?: string | null;
          google_maps?: string | null;
          features?: Json | null;
          rules_policies?: Json | null;
          slug?: string;
        };
        Relationships: [];
      };
      wedding_gallery: {
        Row: {
          gallery_id: number;
          wedding_id: number;
          media_type: string | null;
          media_url: string;
          is_cover: boolean | null;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: {
          gallery_id?: number;
          wedding_id: number;
          media_type?: string | null;
          media_url: string;
          is_cover?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Update: {
          gallery_id?: number;
          wedding_id?: number;
          media_type?: string | null;
          media_url?: string;
          is_cover?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      wedding_tags: {
        Row: {
          tag_id: number;
          wedding_id: number;
          tag_name: string;
        };
        Insert: {
          tag_id?: number;
          wedding_id: number;
          tag_name: string;
        };
        Update: {
          tag_id?: number;
          wedding_id?: number;
          tag_name?: string;
        };
        Relationships: [];
      };
      wedding_vendors: {
        Row: {
          wedding_vendor_id: number;
          wedding_id: number;
          vendor_id: number | null;
          venue_id: number | null;
          role: string | null;
          created_at: string | null;
        };
        Insert: {
          wedding_vendor_id?: number;
          wedding_id: number;
          vendor_id?: number | null;
          venue_id?: number | null;
          role?: string | null;
          created_at?: string | null;
        };
        Update: {
          wedding_vendor_id?: number;
          wedding_id?: number;
          vendor_id?: number | null;
          venue_id?: number | null;
          role?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      admin_status_enum: "active" | "inactive" | "pending";
      banner_status_enum: "active" | "inactive" | "pending";
      report_status_enum: "active" | "inactive" | "pending";
      status_enum: "Active" | "Inactive" | "Draft" | "Pending" | "Published" | "Approved" | "Rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PublicTableName = keyof Database["public"]["Tables"];
export type TableRow<T extends PublicTableName> = Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends PublicTableName> = Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends PublicTableName> = Database["public"]["Tables"][T]["Update"];
