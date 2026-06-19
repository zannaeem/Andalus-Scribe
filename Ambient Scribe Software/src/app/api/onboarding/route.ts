import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

async function getSupabaseWithUser() {
  const cookieStore = await cookies();

  // Auth client — uses anon key + cookies to identify the user
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
  const { data: { user } } = await authClient.auth.getUser();

  // Admin client — uses service role key to bypass RLS for server-side operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  return { supabase, user };
}

// GET /api/onboarding — fetch current onboarding state
export async function GET() {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // Create profile if it doesn't exist
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        display_name: user.user_metadata?.name || '',
        onboarding_completed: false,
        onboarding_step: 1,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(newProfile);
  }

  return NextResponse.json(profile);
}

// POST /api/onboarding — save a step's data
export async function POST(request: NextRequest) {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { step, data } = body;

  if (!step || !data) {
    return NextResponse.json({ error: 'Missing step or data' }, { status: 400 });
  }

  switch (step) {
    case 1: {
      // About You: full_name, display_name, country
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          display_name: data.display_name,
          country: data.country,
          onboarding_step: 2,
        })
        .eq('id', user.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      break;
    }

    case 2: {
      // Profession
      const { error } = await supabase
        .from('profiles')
        .update({
          profession: data.profession,
          profession_other: data.profession_other || null,
          onboarding_step: 3,
        })
        .eq('id', user.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      break;
    }

    case 3: {
      // Clinic Details — create or update clinic, link user
      // First check if user already has a clinic
      const { data: existingLink } = await supabase
        .from('clinic_users')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single();

      let clinicId = existingLink?.clinic_id;

      if (clinicId) {
        // Update existing clinic
        await supabase
          .from('clinics')
          .update({
            name: data.clinic_name,
            clinic_size: data.clinic_size,
            phone: data.phone_number,
          })
          .eq('id', clinicId);
      } else {
        // Create new clinic
        const { data: newClinic, error: clinicError } = await supabase
          .from('clinics')
          .insert({
            name: data.clinic_name,
            clinic_size: data.clinic_size,
            phone: data.phone_number,
            subscription_status: 'trial',
            subscription_plan: 'starter',
            ai_confidence_threshold: 0.7,
            loyalty_enabled: false,
            loyalty_points_per_appointment: 10,
            loyalty_reward_catalog: [],
            wa_connected: false,
            business_hours: {},
          })
          .select('id')
          .single();

        if (clinicError) return NextResponse.json({ error: clinicError.message }, { status: 500 });
        clinicId = newClinic.id;

        // Link user to clinic as owner
        await supabase.from('clinic_users').insert({
          clinic_id: clinicId,
          user_id: user.id,
          name: (await supabase.from('profiles').select('full_name').eq('id', user.id).single()).data?.full_name || '',
          email: user.email,
          role: 'owner',
          invited_at: new Date().toISOString(),
          accepted_at: new Date().toISOString(),
        });
      }

      // Update profile step
      await supabase
        .from('profiles')
        .update({ onboarding_step: 4 })
        .eq('id', user.id);

      break;
    }

    case 4: {
      // Tool Setup — just advance the step (tools are configured separately)
      await supabase
        .from('profiles')
        .update({ onboarding_step: 5 })
        .eq('id', user.id);
      break;
    }

    case 5: {
      // Privacy & Terms — mark onboarding complete
      const { data: link } = await supabase
        .from('clinic_users')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single();

      if (link?.clinic_id) {
        await supabase
          .from('clinics')
          .update({ terms_accepted_at: new Date().toISOString() })
          .eq('id', link.clinic_id);
      }

      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_step: 5,
          terms_accepted_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      break;
    }

    default:
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
  }

  // Return updated profile
  const { data: updatedProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return NextResponse.json(updatedProfile);
}
