import { createClient } from '@supabase/supabase-js'

// یہاں اپنی کاپی کی ہوئی URL اور Key پیسٹ کریں
const supabaseUrl = 'https://hgvuyxyspigmaqiodhoh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhndnV5eHlzcGlnbWFxaW9kaG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NjAxNjYsImV4cCI6MjA3MDIzNjE2Nn0.mfvQ7vSsWIG5G44Vq6pt2rfujevRrb8Wowq0niHlcms'

export const supabase = createClient(supabaseUrl, supabaseKey)