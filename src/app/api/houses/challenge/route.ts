import { randomInt, randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import {
  ensureCommunitySchema,
  ensureHouseAssignment,
  getCommunitySql,
  getCommunityUser,
} from '@/lib/community';
import {
  calculateHouseChallengeScore,
  HOUSE_CHALLENGE_QUESTIONS,
  type ChallengeQuestion,
} from '@/lib/houseChallenge';

export const dynamic = 'force-dynamic';
const QUESTIONS_PER_ATTEMPT = 10;

interface StoredQuestionOrder {
  id: string;
  choices: string[];
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return (value as T) ?? fallback;
}

function getQuestionState(
  questionIds: string[],
  optionOrder: StoredQuestionOrder[],
  answers?: Record<string, string>,
  includeResults = false
) {
  return questionIds.flatMap((id) => {
    const question = HOUSE_CHALLENGE_QUESTIONS.find((item) => item.id === id);
    const order = optionOrder.find((item) => item.id === id);
    if (!question || !order) return [];
    const choices = order.choices.flatMap((choiceId) => {
      const choice = question.choices.find((item) => item.id === choiceId);
      return choice ? [choice] : [];
    });
    return [{
      id: question.id,
      house: question.house,
      question: question.question,
      choices,
      ...(answers ? { selectedChoiceId: answers[question.id] } : {}),
      ...(includeResults ? {
        correctChoiceId: question.answerId,
        explanation: question.explanation,
      } : {}),
    }];
  });
}

function getScoreBreakdown(correct: number) {
  return {
    correct,
    total: QUESTIONS_PER_ATTEMPT,
    answerPoints: correct * 100,
    completionBonus: 200,
    thresholdBonus: correct >= 7 ? 500 : 0,
    perfectBonus: correct === 10 ? 1000 : 0,
    totalPoints: calculateHouseChallengeScore(correct),
  };
}

export async function GET(request: Request) {
  const user = getCommunityUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const sql = getCommunitySql();
    await ensureCommunitySchema(sql);
    const assignment = await ensureHouseAssignment(sql, user);
    if (!assignment.house) {
      return NextResponse.json({ error: 'Choose a House to access the challenge.' }, { status: 403 });
    }
    const [attempts, activeAttempts, leaderboard] = await Promise.all([
      sql`
        SELECT id, house, correct_count, points, started_at, submitted_at
        FROM interstellers_house_challenge_attempts
        WHERE user_id = ${user.id} AND status = 'submitted'
        ORDER BY submitted_at DESC
        LIMIT 20
      `,
      sql`
        SELECT id, house, question_ids, option_order, draft_answers, started_at
        FROM interstellers_house_challenge_attempts
        WHERE user_id = ${user.id} AND status = 'in_progress'
        ORDER BY started_at DESC
        LIMIT 1
      `,
      sql`
        SELECT t.user_id,
          (array_agg(t.user_data ORDER BY t.created_at DESC))[1] AS user_data,
          (array_agg(t.house ORDER BY t.created_at DESC))[1] AS house,
          SUM(t.points)::int AS points
        FROM interstellers_point_transactions t
        WHERE t.activity_type = 'house_challenge_attempt'
        GROUP BY t.user_id
        ORDER BY points DESC, MIN(t.user_data->>'name') ASC
        LIMIT 20
      `,
    ]);
    const active = activeAttempts[0];
    const activeAttempt = active
      ? {
          id: active.id,
          house: active.house,
          questions: getQuestionState(
            parseJson<string[]>(active.question_ids, []),
            parseJson<StoredQuestionOrder[]>(active.option_order, []),
            parseJson<Record<string, string>>(active.draft_answers, {})
          ),
        }
      : null;
    return NextResponse.json({
      activeAttempt,
      history: attempts.map((attempt) => ({
        id: attempt.id,
        house: attempt.house,
        correct: Number(attempt.correct_count),
        points: Number(attempt.points),
        startedAt: attempt.started_at,
        submittedAt: attempt.submitted_at,
      })),
      leaderboard: leaderboard.map((entry, index) => {
        const profile = parseJson<Record<string, unknown>>(entry.user_data, {});
        return {
          rank: index + 1,
          name: typeof profile.name === 'string' ? profile.name : 'Community member',
          avatar: typeof profile.avatar === 'string' ? profile.avatar : '',
          house: entry.house,
          points: Number(entry.points),
          isCurrentUser: entry.user_id === user.id,
        };
      }),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('House challenge data fetch failed:', error);
    return NextResponse.json({ error: 'Challenge data is temporarily unavailable.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = getCommunityUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A challenge action is required.' }, { status: 400 });
    }
    const sql = getCommunitySql();
    await ensureCommunitySchema(sql);
    const assignment = await ensureHouseAssignment(sql, user);
    if (!assignment.house) {
      return NextResponse.json({ error: 'Choose a House before starting the challenge.' }, { status: 403 });
    }

    if (body.action === 'start') {
      const existing = await sql`
        SELECT id, house, question_ids, option_order, draft_answers
        FROM interstellers_house_challenge_attempts
        WHERE user_id = ${user.id} AND status = 'in_progress'
        ORDER BY started_at DESC
        LIMIT 1
      `;
      if (existing.length) {
        return NextResponse.json({
          attemptId: existing[0].id,
          questions: getQuestionState(
            parseJson<string[]>(existing[0].question_ids, []),
            parseJson<StoredQuestionOrder[]>(existing[0].option_order, []),
            parseJson<Record<string, string>>(existing[0].draft_answers, {})
          ),
          resumed: true,
        });
      }

      const selected = shuffle(HOUSE_CHALLENGE_QUESTIONS).slice(0, QUESTIONS_PER_ATTEMPT);
      const order: StoredQuestionOrder[] = selected.map((question) => ({
        id: question.id,
        choices: shuffle(question.choices).map((choice) => choice.id),
      }));
      const attemptId = randomUUID();
      const questionIds = selected.map((question) => question.id);
      await sql`
        INSERT INTO interstellers_house_challenge_attempts (
          id, user_id, house, question_ids, option_order, status
        )
        VALUES (
          ${attemptId},
          ${user.id},
          ${assignment.house},
          ${JSON.stringify(questionIds)}::jsonb,
          ${JSON.stringify(order)}::jsonb,
          'in_progress'
        )
      `;
      return NextResponse.json({
        attemptId,
        questions: getQuestionState(questionIds, order),
      }, { status: 201 });
    }

    if (body.action === 'save_answer') {
      if (
        typeof body.attemptId !== 'string' ||
        !/^[0-9a-f-]{36}$/i.test(body.attemptId) ||
        typeof body.questionId !== 'string' ||
        typeof body.choiceId !== 'string'
      ) {
        return NextResponse.json({ error: 'A valid challenge answer is required.' }, { status: 400 });
      }
      const rows = await sql`
        UPDATE interstellers_house_challenge_attempts
        SET draft_answers = jsonb_set(
          draft_answers,
          ARRAY[${body.questionId}],
          to_jsonb(${body.choiceId}::text),
          true
        )
        WHERE id = ${body.attemptId}
          AND user_id = ${user.id}
          AND status = 'in_progress'
          AND question_ids ? ${body.questionId}
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(option_order) AS question(value)
            WHERE question.value->>'id' = ${body.questionId}
              AND question.value->'choices' ? ${body.choiceId}
          )
        RETURNING id
      `;
      if (!rows.length) {
        return NextResponse.json({ error: 'Challenge answer is invalid or the attempt is no longer active.' }, { status: 409 });
      }
      return NextResponse.json({ success: true });
    }

    if (body.action === 'submit') {
      if (typeof body.attemptId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.attemptId)) {
        return NextResponse.json({ error: 'A valid challenge attempt ID is required.' }, { status: 400 });
      }
      if (!body.answers || typeof body.answers !== 'object' || Array.isArray(body.answers)) {
        return NextResponse.json({ error: 'Answers for all 10 questions are required.' }, { status: 400 });
      }
      const attempts = await sql`
        SELECT id, house, question_ids, option_order, draft_answers, status, answers, correct_count, points
        FROM interstellers_house_challenge_attempts
        WHERE id = ${body.attemptId} AND user_id = ${user.id}
      `;
      if (!attempts.length) {
        return NextResponse.json({ error: 'Challenge attempt not found.' }, { status: 404 });
      }
      const attempt = attempts[0];
      const questionIds = parseJson<string[]>(attempt.question_ids, []);
      const optionOrder = parseJson<StoredQuestionOrder[]>(attempt.option_order, []);
      const existingAnswers = parseJson<Record<string, string> | null>(attempt.answers, null);
      if (attempt.status === 'submitted') {
        if (!existingAnswers) {
          return NextResponse.json({ error: 'Submitted challenge results are unavailable.' }, { status: 500 });
        }
        const correct = Number(attempt.correct_count);
        return NextResponse.json({
          duplicate: true,
          score: getScoreBreakdown(correct),
          questions: getQuestionState(questionIds, optionOrder, existingAnswers, true),
        });
      }
      if (questionIds.length !== QUESTIONS_PER_ATTEMPT) {
        return NextResponse.json({ error: 'Challenge attempt has invalid question state.' }, { status: 409 });
      }
      const answerKeys = Object.keys(body.answers);
      if (
        answerKeys.length !== QUESTIONS_PER_ATTEMPT ||
        questionIds.some((id) => !answerKeys.includes(id)) ||
        answerKeys.some((id) => !questionIds.includes(id))
      ) {
        return NextResponse.json({ error: 'Submit exactly one answer for each selected question.' }, { status: 400 });
      }
      const answers: Record<string, string> = {};
      for (const questionId of questionIds) {
        const selectedChoiceId = body.answers[questionId];
        const order = optionOrder.find((item) => item.id === questionId);
        if (typeof selectedChoiceId !== 'string' || !order?.choices.includes(selectedChoiceId)) {
          return NextResponse.json({ error: 'One or more answers are invalid.' }, { status: 400 });
        }
        answers[questionId] = selectedChoiceId;
      }
      const questionMap = new Map(HOUSE_CHALLENGE_QUESTIONS.map((question) => [question.id, question]));
      const correct = questionIds.reduce(
        (total, id) => total + (questionMap.get(id)?.answerId === answers[id] ? 1 : 0),
        0
      );
      const points = calculateHouseChallengeScore(correct);
      const completed = await sql`
        WITH submitted AS (
          UPDATE interstellers_house_challenge_attempts
          SET status = 'submitted',
              answers = ${JSON.stringify(answers)}::jsonb,
              correct_count = ${correct},
              points = ${points},
              submitted_at = NOW()
          WHERE id = ${body.attemptId}
            AND user_id = ${user.id}
            AND status = 'in_progress'
          RETURNING id, user_id, house, points, correct_count
        ),
        reward AS (
          INSERT INTO interstellers_point_transactions (
            idempotency_key, user_id, user_data, house, activity_type, related_id, points
          )
          SELECT
            ${`house_challenge:${body.attemptId}`},
            submitted.user_id,
            ${JSON.stringify({ name: user.name, handle: user.handle, avatar: user.avatar })}::jsonb,
            submitted.house,
            'house_challenge_attempt',
            submitted.id,
            submitted.points
          FROM submitted
          ON CONFLICT (idempotency_key) DO NOTHING
          RETURNING idempotency_key
        )
        SELECT id FROM submitted
      `;
      if (!completed.length) {
        const latest = await sql`
          SELECT status, answers, correct_count
          FROM interstellers_house_challenge_attempts
          WHERE id = ${body.attemptId} AND user_id = ${user.id}
        `;
        if (latest[0]?.status === 'submitted') {
          const savedAnswers = parseJson<Record<string, string> | null>(latest[0].answers, null);
          if (!savedAnswers) {
            return NextResponse.json({ error: 'Submitted challenge results are unavailable.' }, { status: 500 });
          }
          const savedCorrect = Number(latest[0].correct_count);
          return NextResponse.json({
            duplicate: true,
            score: getScoreBreakdown(savedCorrect),
            questions: getQuestionState(questionIds, optionOrder, savedAnswers, true),
          });
        }
        return NextResponse.json({ error: 'Challenge attempt could not be submitted.' }, { status: 409 });
      }
      return NextResponse.json({
        duplicate: false,
        score: getScoreBreakdown(correct),
        questions: getQuestionState(questionIds, optionOrder, answers, true),
      });
    }
    return NextResponse.json({ error: 'Unsupported challenge action.' }, { status: 400 });
  } catch (error) {
    console.error('House challenge operation failed:', error);
    return NextResponse.json({ error: 'Challenge could not be saved.' }, { status: 500 });
  }
}
