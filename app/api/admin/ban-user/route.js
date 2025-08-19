import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId, banStatus } = await request.json();
    
    if (userId === undefined || banStatus === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the user to be banned
    const { data: targetUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent banning admin users
    if (targetUser.email.includes('@admin') || targetUser.email.includes('@superadmin')) {
      return NextResponse.json(
        { error: 'Cannot ban admin users' },
        { status: 403 }
      );
    }

    // Update the banned status
    const { data, error } = await supabase
      .from('users')
      .update({ banned: banStatus })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Ban update error:', error);
      return NextResponse.json(
        { error: 'Failed to update user status', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: banStatus ? 'User banned successfully' : 'User unbanned successfully',
      user: data[0]
    });

  } catch (error) {
    console.error('Ban user API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 