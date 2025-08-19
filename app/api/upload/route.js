import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');

    if (!file || !userId) {
      return new Response(JSON.stringify({ 
        error: 'Missing file or user ID',
        details: !file ? 'No file provided' : 'No user ID provided'
      }), { status: 400 });
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `profile.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Step 1: Ensure the bucket exists
    try {
      await supabaseAdmin.storage.getBucket('profile-pictures');
    } catch (error) {
      // If bucket doesn't exist, create it
      await supabaseAdmin.storage.createBucket('profile-pictures', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });
    }

    // Step 2: Upload the file
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('profile-pictures')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ 
        error: 'Failed to upload file',
        details: uploadError.message
      }), { status: 500 });
    }

    // Step 3: Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    // Step 4: Update user's profile
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        picture: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Failed to update profile',
        details: updateError.message
      }), { status: 500 });
    }

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      timestamp: Date.now()
    }), { status: 200 });

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), { status: 500 });
  }
}
