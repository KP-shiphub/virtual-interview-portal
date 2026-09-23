import { supabase } from '../supabaseClient'

const STORAGE_BUCKET =
  'interview-recordings'


// ============================================================
// GET ALL PARTICIPANTS
// ============================================================

export async function getParticipants() {
  const {
    data,
    error,
  } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      role,
      created_at
    `)
    .eq('role', 'participant')
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data || []
}


// ============================================================
// GET INTERVIEWS
// ============================================================

export async function getInterviews() {
  const {
    data,
    error,
  } = await supabase
    .from('interviews')
    .select(`
      id,
      participant_id,
      status,
      current_question_number,
      started_at,
      completed_at,
      created_at
    `)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data || []
}


// ============================================================
// GET OVERVIEW STATISTICS
// ============================================================

export async function getAdminStatistics() {
  const [
    profilesResult,
    interviewsResult,
    completedResult,
    inProgressResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('role', 'participant'),

    supabase
      .from('interviews')
      .select('id', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('interviews')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'completed'),

    supabase
      .from('interviews')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'in_progress'),
  ])


  if (profilesResult.error) {
    throw profilesResult.error
  }

  if (interviewsResult.error) {
    throw interviewsResult.error
  }

  if (completedResult.error) {
    throw completedResult.error
  }

  if (inProgressResult.error) {
    throw inProgressResult.error
  }


  return {
    totalParticipants:
      profilesResult.count || 0,

    totalInterviews:
      interviewsResult.count || 0,

    completedInterviews:
      completedResult.count || 0,

    pendingInterviews:
      inProgressResult.count || 0,
  }
}


// ============================================================
// GET ONE PARTICIPANT
// ============================================================

export async function getParticipant(
  participantId
) {
  const {
    data,
    error,
  } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      role,
      created_at
    `)
    .eq('id', participantId)
    .single()

  if (error) {
    throw error
  }

  return data
}


// ============================================================
// GET PARTICIPANT INTERVIEW
// ============================================================

export async function getParticipantInterview(
  participantId
) {
  const {
    data,
    error,
  } = await supabase
    .from('interviews')
    .select(`
      id,
      participant_id,
      status,
      current_question_number,
      started_at,
      completed_at,
      created_at
    `)
    .eq('participant_id', participantId)
    .order('created_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}


// ============================================================
// GET INTERVIEW ANSWERS
// Answers are returned in the order they were created.
// This gives us interview serial numbers 1 - 20.
// ============================================================

export async function getInterviewAnswers(
  interviewId
) {
  const {
    data,
    error,
  } = await supabase
    .from('interview_answers')
    .select(`
      id,
      interview_id,
      question_id,
      participant_id,
      video_path,
      started_at,
      completed_at,
      created_at,
      questions (
        id,
        question_number,
        question_text,
        preparation_time,
        answer_time
      )
    `)
    .eq(
      'interview_id',
      interviewId
    )
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data || []
}


// ============================================================
// CREATE TEMPORARY VIDEO URL
// ============================================================

export async function createRecordingUrl(
  videoPath
) {
  if (!videoPath) {
    throw new Error(
      'No recording path is available for this answer.'
    )
  }


  const {
    data,
    error,
  } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(
      videoPath,
      60 * 10
    )


  if (error) {
    throw new Error(
      error.message ||
        'Supabase could not create a signed URL.'
    )
  }


  if (!data?.signedUrl) {
    throw new Error(
      'Supabase returned an empty signed URL.'
    )
  }


  return data.signedUrl
}