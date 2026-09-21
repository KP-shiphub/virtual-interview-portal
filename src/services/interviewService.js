import { supabase } from '../supabaseClient'

const STORAGE_BUCKET = 'interview-recordings'


// ============================================================
// GET ALL 20 INTERVIEW QUESTIONS
// ============================================================

export async function getInterviewQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select(
      `
      id,
      question_number,
      question_text,
      preparation_time,
      answer_time
      `
    )
    .order('question_number', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data || []
}


// ============================================================
// GET EXISTING INTERVIEW OR CREATE A NEW ONE
// ============================================================

export async function getOrCreateInterview(
  userId
) {
  const {
    data: latestInterview,
    error: findError,
  } = await supabase
    .from('interviews')
    .select(
      `
      id,
      participant_id,
      status,
      current_question_number,
      started_at,
      completed_at,
      created_at
      `
    )
    .eq('participant_id', userId)
    .order('created_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle()

  if (findError) {
    throw findError
  }

  if (!latestInterview) {
    const {
      data: newInterview,
      error: createError,
    } = await supabase
      .from('interviews')
      .insert({
        participant_id: userId,
        status: 'in_progress',
        current_question_number: 1,
        started_at:
          new Date().toISOString(),
      })
      .select(
        `
        id,
        participant_id,
        status,
        current_question_number,
        started_at,
        completed_at,
        created_at
        `
      )
      .single()

    if (createError) {
      throw createError
    }

    return newInterview
  }

  if (
    latestInterview.status ===
    'completed'
  ) {
    const completedError =
      new Error(
        'Your interview has already been completed.'
      )

    completedError.code =
      'INTERVIEW_ALREADY_COMPLETED'

    throw completedError
  }

  if (
    latestInterview.status ===
    'failed'
  ) {
    const failedError =
      new Error(
        'Your previous interview session requires administrative attention.'
      )

    failedError.code =
      'INTERVIEW_FAILED'

    throw failedError
  }

  return latestInterview
}


// ============================================================
// UPLOAD INTERVIEW RECORDING
// ============================================================

export async function uploadInterviewRecording({
  participantId,
  interviewId,
  questionNumber,
  blob,
  contentType,
}) {
  const isMp4 =
    contentType.includes('mp4')

  const extension = isMp4
    ? 'mp4'
    : 'webm'

  const storageContentType = isMp4
    ? 'video/mp4'
    : 'video/webm'

  const paddedQuestionNumber =
    String(questionNumber).padStart(2, '0')

  const filePath =
    `${participantId}/${interviewId}/question-${paddedQuestionNumber}.${extension}`

  const {
    data,
    error,
  } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .upload(
      filePath,
      blob,
      {
        contentType: storageContentType,
        cacheControl: '3600',
        upsert: true,
      }
    )

  if (error) {
    throw error
  }

  return {
    path: data.path,
  }
}


// ============================================================
// SAVE ANSWER INFORMATION
// ============================================================

export async function saveInterviewAnswer({
  interviewId,
  questionId,
  participantId,
  videoPath,
  startedAt,
  completedAt,
}) {
  const {
    data,
    error,
  } = await supabase
    .from('interview_answers')
    .upsert(
      {
        interview_id: interviewId,
        question_id: questionId,
        participant_id: participantId,
        video_path: videoPath,
        started_at: startedAt,
        completed_at: completedAt,
      },
      {
        onConflict:
          'interview_id,question_id',
      }
    )
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}


// ============================================================
// UPDATE INTERVIEW PROGRESS
// ============================================================

export async function updateInterviewProgress(
  interviewId,
  currentQuestionNumber
) {
  const {
    error,
  } = await supabase
    .from('interviews')
    .update({
      current_question_number:
        currentQuestionNumber,
    })
    .eq('id', interviewId)

  if (error) {
    throw error
  }
}


// ============================================================
// COMPLETE INTERVIEW
// ============================================================

export async function completeInterview(
  interviewId
) {
  const {
    data,
    error,
  } = await supabase
    .from('interviews')
    .update({
      status: 'completed',
      current_question_number: 20,
      completed_at:
        new Date().toISOString(),
    })
    .eq('id', interviewId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// ============================================================
// GET PARTICIPANT'S LATEST INTERVIEW
// ============================================================

export async function getLatestInterview(
  userId
) {
  const { data, error } = await supabase
    .from('interviews')
    .select(
      `
      id,
      participant_id,
      status,
      current_question_number,
      started_at,
      completed_at,
      created_at
      `
    )
    .eq('participant_id', userId)
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
// GET INTERVIEW STATUS
// ============================================================

export async function getInterviewStatus(
  userId
) {
  const {
    data,
    error,
  } = await supabase
    .from('interviews')
    .select(
      `
      id,
      status,
      current_question_number,
      started_at,
      completed_at,
      created_at
      `
    )
    .eq('participant_id', userId)
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