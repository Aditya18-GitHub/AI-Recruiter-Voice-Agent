import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    
    if (!file || !userId) {
      return new Response(JSON.stringify({ error: 'Missing file or user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase Admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      }
    );

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `profile.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // 1. Upload the file using the admin client
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('profile-pictures')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
          cacheControl: '3600',
        }, {
          // This is the key part - use the admin API
          headers: {
            'x-upsert': 'true',
            'authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          }
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // 2. Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // 3. Update user's profile in the database using the admin client
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          picture: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      return new Response(JSON.stringify({ 
        success: true, 
        url: urlData.publicUrl,
        timestamp: Date.now()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to process your request',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
