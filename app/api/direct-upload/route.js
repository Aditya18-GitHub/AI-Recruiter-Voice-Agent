import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize the admin client for both database and storage operations
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to create consistent JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json'
    }
  });
}

export async function POST(request) {
  const handleError = (error, status = 500) => {
    console.error('API Error:', error);
    return jsonResponse({
      success: false,
      error: error.message || 'An error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, status);
  };

  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return handleError(new Error('Invalid content type. Expected multipart/form-data'), 400);
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');

    if (!file || !userId) {
      return handleError(new Error(!file ? 'No file provided' : 'No user ID provided'), 400);
    }

    // Generate file path with user ID as folder
    const fileExt = file.name.split('.').pop();
    const fileName = `profile.${fileExt}`;
    const filePath = `${userId}/${fileName}`.replace(/\/+/g, '/');
    
    console.log('Uploading file:', { filePath, type: file.type, size: file.size });
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return handleError(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), 400);
    }
    
    // Convert file to buffer with size validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return handleError(new Error(`File size exceeds the maximum limit of 5MB`), 400);
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // Check if bucket exists and create if it doesn't
      console.log('Checking bucket...');
      try {
        // List buckets to check if it exists
        const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
        
        if (listError) throw listError;
        
        const bucketExists = buckets.some(bucket => bucket.name === 'profile-pictures');
        
        if (!bucketExists) {
          console.log('Creating profile-pictures bucket...');
          const { error: createError } = await supabaseAdmin.storage.createBucket('profile-pictures', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            fileSizeLimit: 5 * 1024 * 1024 // 5MB
          });
          
          if (createError) throw createError;
          console.log('Bucket created successfully');
        } else {
          console.log('Bucket exists');
        }
      } catch (error) {
        console.error('Bucket check/creation failed:', error);
        return handleError(new Error('Failed to initialize storage bucket'), 500);
      }
      // 1. Delete any existing profile pictures for this user
      try {
        console.log('Cleaning up existing files...');
        const { data: existingFiles, error: listError } = await supabaseAdmin.storage
          .from('profile-pictures')
          .list(userId);
          
        if (!listError && existingFiles && existingFiles.length > 0) {
          console.log(`Found ${existingFiles.length} existing files to remove`);
          const filesToRemove = existingFiles.map(f => `${userId}/${f.name}`);
          
          const { error: removeError } = await supabaseAdmin.storage
            .from('profile-pictures')
            .remove(filesToRemove);
            
          if (!removeError) {
            console.log('Successfully removed existing files');
          }
        }
      } catch (cleanupError) {
        console.warn('Cleanup failed, continuing...', cleanupError);
      }

      // 2. Upload the file using fetch API directly to Supabase Storage
      console.log('Starting direct file upload to Supabase Storage...');
      
      // Create a FormData object to send the file
      const uploadFormData = new FormData();
      const blob = new Blob([buffer], { type: file.type });
      uploadFormData.append('file', blob, fileName);
      
      // Construct the upload URL
      const uploadUrl = `${supabaseUrl}/storage/v1/object/profile-pictures/${filePath}`;
      
      // Make the upload request
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'x-upsert': 'true',
          'Cache-Control': 'public, max-age=31536000',
        },
        body: uploadFormData
      });
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        console.error('Upload failed:', uploadResult);
        throw new Error(uploadResult.message || 'Failed to upload file to storage');
      }
      
      console.log('File upload successful:', uploadResult);
      
      // Verify the file was uploaded
      const { data: verifyData, error: verifyError } = await supabaseAdmin.storage
        .from('profile-pictures')
        .list(userId);
      
      if (verifyError) {
        console.warn('Warning: Could not verify file upload:', verifyError);
      } else {
        console.log('Uploaded files in user directory:', verifyData);
      }

      // 3. Get public URL with forced refresh
      let publicUrl;
      try {
        // First try to get the public URL
        const publicUrlResponse = supabaseAdmin.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);
          
        publicUrl = publicUrlResponse?.data?.publicUrl;
        
        // If we don't get a public URL, construct it manually
        if (!publicUrl) {
          console.warn('Failed to get public URL, constructing manually');
          publicUrl = `${supabaseUrl}/storage/v1/object/public/profile-pictures/${filePath}`;
        }
        
        console.log('Generated public URL:', publicUrl);
        
      } catch (urlError) {
        console.error('Error generating public URL:', urlError);
        // Fallback to manual URL construction
        publicUrl = `${supabaseUrl}/storage/v1/object/public/profile-pictures/${filePath}`;
      }

      // 4. Update user's profile with the new picture URL
      try {
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ 
            picture: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Profile update warning:', updateError.message);
        }
      } catch (updateError) {
        console.error('Profile update failed:', updateError);
      }

      console.log('Upload completed successfully');
      return jsonResponse({
        success: true, 
        url: publicUrl,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Upload process error:', error);
      return new Response(JSON.stringify({
        error: 'Failed to process upload',
        details: error.message
      }), { status: 500 });
    }

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), { status: 500 });
  }
}
