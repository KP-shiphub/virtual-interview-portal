import { supabase } from '../supabaseClient'

const STORAGE_BUCKET = 'interview-recordings'

const TOTAL_INTERVIEW_QUESTIONS = 20


// ============================================================
// CREATE A STABLE NUMBER FROM A STRING
// This allows the same interview ID to always produce
// the same question selection.
// ============================================================

function createStableHash(value) {
  let hash = 0

  for (let i = 0; i < value.length; i++) {
    hash =
      (hash << 5) -
      hash +
      value.charCodeAt(i)

    hash |= 0
  }

  return Math.abs(hash)
}


// ============================================================
// GET 20 QUESTIONS FOR A SPECIFIC INTERVIEW
// The same interview ID will always receive the same 20.
// ============================================================

export async function getInterviewQuestions(
  interviewId
) {
  if (!interviewId) {
    throw new Error(
      'Interview ID is required to select questions.'
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from('questions')
    .select(`
      id,
      question_number,
      question_text,
      preparation_time,
      answer_time
    `)

  if (error) {
    throw error
  }

  if (!data || data.length < TOTAL_INTERVIEW_QUESTIONS) {
    throw new Error(
      `The question bank must contain at least ${TOTAL_INTERVIEW_QUESTIONS} questions.`
    )
  }

  // Create a stable value from the interview ID.
  const baseHash = createStableHash(
    interviewId
  )

  // Give every question a stable score based on:
  // interview ID + question ID.
  const scoredQuestions = data.map(
    (question) => {
      const questionHash =
        createStableHash(
          `${baseHash}-${question.id}`
        )

      return {
        question,
        score: questionHash,
      }
    }
  )

  // Sort using the stable score.
  scoredQuestions.sort(
    (a, b) => a.score - b.score
  )

  // Select exactly 20 questions.
  const selectedQuestions =
    scoredQuestions
      .slice(
        0,
        TOTAL_INTERVIEW_QUESTIONS
      )
      .map(
        (item) => item.question
      )

  return selectedQuestions
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
    .select(`
      id,
      participant_id,
      status,
      current_question_number,
      started_at,
      completed_at,
      created_at
    `)
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
      .select(`
        id,
        participant_id,
        status,
        current_question_number,
        started_at,
        completed_at,
        created_at
      `)
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

  const storageContentType =
    isMp4
      ? 'video/mp4'
      : 'video/webm'

  const paddedQuestionNumber =
    String(
      questionNumber
    ).padStart(2, '0')

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
        contentType:
          storageContentType,
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
        interview_id:
          interviewId,

        question_id:
          questionId,

        participant_id:
          participantId,

        video_path:
          videoPath,

        started_at:
          startedAt,

        completed_at:
          completedAt,
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
// currentQuestionNumber is ALWAYS the interview serial number:
// 1, 2, 3 ... 20
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
      current_question_number:
        TOTAL_INTERVIEW_QUESTIONS,
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
    .select(`
      id,
      status,
      current_question_number,
      started_at,
      completed_at,
      created_at
    `)
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