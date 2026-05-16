// GBP Mock Data - Realistic demo data for FETS Cochin & Calicut
// Used as fallback when Google Business Profile API approval is pending (quota=0)

import type {
  GBPBranch,
  GBPLocation,
  GBPReview,
  GBPReviewsResponse,
  GBPLocalPost,
  GBPQuestion,
  GBPQuestionsResponse,
  GBPInsightsResponse,
  GBPMetric,
} from '../types/gbp.types'

// ── Helpers ──────────────────────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10)
}

// ── Locations ────────────────────────────────────────────────────────────
const MOCK_LOCATIONS: Record<GBPBranch, GBPLocation> = {
  cochin: {
    name: 'locations/cochin-fets',
    title: 'FETS - Cochin (Pearson VUE Authorized Test Center)',
    phoneNumbers: { primaryPhone: '+91 484 235 6789' },
    websiteUri: 'https://fets.live',
    profile: { description: 'FETS Cochin is a Pearson VUE Authorized Test Center offering professional certification exams including CMA, CPA, and other global exams.' },
    regularHours: {
      periods: [
        { openDay: 'MONDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'MONDAY', closeTime: { hours: 18, minutes: 0 } },
        { openDay: 'TUESDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'TUESDAY', closeTime: { hours: 18, minutes: 0 } },
        { openDay: 'WEDNESDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'WEDNESDAY', closeTime: { hours: 18, minutes: 0 } },
        { openDay: 'THURSDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'THURSDAY', closeTime: { hours: 18, minutes: 0 } },
        { openDay: 'FRIDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'FRIDAY', closeTime: { hours: 18, minutes: 0 } },
        { openDay: 'SATURDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'SATURDAY', closeTime: { hours: 14, minutes: 0 } },
      ],
    },
  },
  calicut: {
    name: 'locations/calicut-fets',
    title: 'FETS - Calicut (Pearson VUE Authorized Test Center)',
    phoneNumbers: { primaryPhone: '+91 495 276 1234' },
    websiteUri: 'https://fets.live',
    profile: { description: 'FETS Calicut is a Pearson VUE Authorized Test Center offering professional certification exams in North Kerala.' },
    regularHours: {
      periods: [
        { openDay: 'MONDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'MONDAY', closeTime: { hours: 18, minutes: 0 } },
        { openDay: 'TUESDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'TUESDAY', closeTime: { hours: 18, minutes: 0 } },
        { openDay: 'WEDNESDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'WEDNESDAY', closeTime: { hours: 18, minutes: 0 } },
        { openDay: 'THURSDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'THURSDAY', closeTime: { hours: 18, minutes: 0 } },
        { openDay: 'FRIDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'FRIDAY', closeTime: { hours: 18, minutes: 0 } },
        { openDay: 'SATURDAY', openTime: { hours: 9, minutes: 0 }, closeDay: 'SATURDAY', closeTime: { hours: 14, minutes: 0 } },
      ],
    },
  },
}

// ── Reviews ──────────────────────────────────────────────────────────────
function makeMockReviews(branch: GBPBranch): GBPReview[] {
  const branchLabel = branch === 'cochin' ? 'Cochin' : 'Calicut'
  return [
    {
      name: `locations/${branch}/reviews/r1`,
      reviewId: `r1-${branch}`,
      reviewer: { displayName: 'Arjun Menon', isAnonymous: false },
      starRating: 'FIVE',
      comment: `Excellent test center! Very well-organized and the staff at FETS ${branchLabel} were extremely helpful. The facility is clean and comfortable. Highly recommended for any professional exam.`,
      createTime: daysAgo(3),
      updateTime: daysAgo(3),
      reviewReply: { comment: `Thank you, Arjun! We're glad you had a great experience at FETS ${branchLabel}. Best of luck with your results!`, updateTime: daysAgo(2) },
    },
    {
      name: `locations/${branch}/reviews/r2`,
      reviewId: `r2-${branch}`,
      reviewer: { displayName: 'Sneha Krishnan', isAnonymous: false },
      starRating: 'FIVE',
      comment: 'Took my CMA exam here. Perfect environment for testing - quiet, well air-conditioned, and the computers were fast. Check-in process was smooth.',
      createTime: daysAgo(7),
      updateTime: daysAgo(7),
    },
    {
      name: `locations/${branch}/reviews/r3`,
      reviewId: `r3-${branch}`,
      reviewer: { displayName: 'Mohammed Faiz', isAnonymous: false },
      starRating: 'FOUR',
      comment: 'Good center overall. Slightly hard to find the entrance first time but once inside everything was professional. Would come back for future exams.',
      createTime: daysAgo(12),
      updateTime: daysAgo(12),
      reviewReply: { comment: 'Thank you for your feedback, Mohammed! We have added better signage near the entrance. See you next time!', updateTime: daysAgo(11) },
    },
    {
      name: `locations/${branch}/reviews/r4`,
      reviewId: `r4-${branch}`,
      reviewer: { displayName: 'Priya Nair', isAnonymous: false },
      starRating: 'FIVE',
      comment: 'Best test center in Kerala! I have taken exams at multiple Pearson VUE centers and FETS is by far the best. Clean facilities, friendly staff, and easy booking process through fets.live.',
      createTime: daysAgo(15),
      updateTime: daysAgo(15),
    },
    {
      name: `locations/${branch}/reviews/r5`,
      reviewId: `r5-${branch}`,
      reviewer: { displayName: 'Rahul Sharma', isAnonymous: false },
      starRating: 'FOUR',
      comment: 'Professional setup. Parking was available which is a big plus. Staff guided me through the check-in process nicely.',
      createTime: daysAgo(20),
      updateTime: daysAgo(20),
    },
    {
      name: `locations/${branch}/reviews/r6`,
      reviewId: `r6-${branch}`,
      reviewer: { displayName: 'Amitha Thomas', isAnonymous: false },
      starRating: 'FIVE',
      comment: `Completed my PMP certification exam at FETS ${branchLabel}. Everything was perfect - from the booking process to the actual exam day. The locker facility for personal belongings was a nice touch.`,
      createTime: daysAgo(25),
      updateTime: daysAgo(25),
      reviewReply: { comment: 'Congratulations on your PMP, Amitha! Thank you for choosing FETS. We wish you continued success!', updateTime: daysAgo(24) },
    },
    {
      name: `locations/${branch}/reviews/r7`,
      reviewId: `r7-${branch}`,
      reviewer: { displayName: 'Vivek Kumar', isAnonymous: false },
      starRating: 'THREE',
      comment: 'Decent center. AC was a bit cold during the exam. Otherwise no complaints.',
      createTime: daysAgo(30),
      updateTime: daysAgo(30),
    },
    {
      name: `locations/${branch}/reviews/r8`,
      reviewId: `r8-${branch}`,
      reviewer: { displayName: 'Reshma P', isAnonymous: false },
      starRating: 'FIVE',
      comment: 'Amazing experience! The staff went above and beyond. Will definitely recommend to all my colleagues preparing for professional exams.',
      createTime: daysAgo(35),
      updateTime: daysAgo(35),
    },
  ]
}

// ── Posts ─────────────────────────────────────────────────────────────────
function makeMockPosts(branch: GBPBranch): GBPLocalPost[] {
  const branchLabel = branch === 'cochin' ? 'Cochin' : 'Calicut'
  return [
    {
      name: `locations/${branch}/posts/p1`,
      summary: `New exam slots are now open at FETS ${branchLabel} for June 2026 sessions! Book your CMA, CPA, or other professional exams today at fets.live.`,
      topicType: 'STANDARD',
      state: 'LIVE',
      createTime: daysAgo(2),
      updateTime: daysAgo(2),
    },
    {
      name: `locations/${branch}/posts/p2`,
      summary: `Congratulations to all May 2026 batch candidates! Results are now available on fets.live. FETS ${branchLabel} is proud of your achievement.`,
      topicType: 'STANDARD',
      state: 'LIVE',
      createTime: daysAgo(8),
      updateTime: daysAgo(8),
    },
    {
      name: `locations/${branch}/posts/p3`,
      summary: `FETS ${branchLabel} will observe a holiday on May 20th. Regular exam schedule resumes May 21st. Plan your bookings accordingly at fets.live.`,
      topicType: 'ALERT',
      state: 'LIVE',
      createTime: daysAgo(14),
      updateTime: daysAgo(14),
    },
  ]
}

// ── Q&A ──────────────────────────────────────────────────────────────────
function makeMockQuestions(branch: GBPBranch): GBPQuestion[] {
  const branchLabel = branch === 'cochin' ? 'Cochin' : 'Calicut'
  return [
    {
      name: `locations/${branch}/questions/q1`,
      author: { displayName: 'Arun K', type: 'REGULAR_USER' },
      upvoteCount: 5,
      text: 'What all exams can I take at this center?',
      createTime: daysAgo(4),
      topAnswers: [{
        name: `locations/${branch}/questions/q1/answers/a1`,
        author: { displayName: 'FETS', type: 'MERCHANT' },
        upvoteCount: 3,
        text: `FETS ${branchLabel} offers Pearson VUE, Prometric, and other professional certification exams including CMA (IMA), CPA (AICPA), PMP, AWS, Microsoft, and many more. Visit fets.live for the complete list.`,
        createTime: daysAgo(3),
      }],
      totalAnswerCount: 1,
    },
    {
      name: `locations/${branch}/questions/q2`,
      author: { displayName: 'Deepa M', type: 'REGULAR_USER' },
      upvoteCount: 3,
      text: 'Is there parking available at the center?',
      createTime: daysAgo(10),
      topAnswers: [{
        name: `locations/${branch}/questions/q2/answers/a1`,
        author: { displayName: 'FETS', type: 'MERCHANT' },
        upvoteCount: 2,
        text: `Yes, free parking is available at FETS ${branchLabel}. We recommend arriving 30 minutes before your scheduled exam time.`,
        createTime: daysAgo(9),
      }],
      totalAnswerCount: 1,
    },
    {
      name: `locations/${branch}/questions/q3`,
      author: { displayName: 'Nikhil R', type: 'REGULAR_USER' },
      upvoteCount: 1,
      text: 'Can I reschedule my exam at the center directly or do I need to do it online?',
      createTime: daysAgo(2),
      totalAnswerCount: 0,
    },
    {
      name: `locations/${branch}/questions/q4`,
      author: { displayName: 'Sreelakshmi V', type: 'REGULAR_USER' },
      upvoteCount: 2,
      text: 'What is the COVID protocol at the center? Do I need to wear a mask?',
      createTime: daysAgo(18),
      topAnswers: [{
        name: `locations/${branch}/questions/q4/answers/a1`,
        author: { displayName: 'FETS', type: 'MERCHANT' },
        upvoteCount: 1,
        text: 'We follow all local health guidelines. Currently masks are optional but hand sanitizer is available at entry. The center is regularly sanitized between exam sessions.',
        createTime: daysAgo(17),
      }],
      totalAnswerCount: 1,
    },
  ]
}

// ── Insights ─────────────────────────────────────────────────────────────
function generateDailyValues(days: number, min: number, max: number) {
  const values = []
  for (let i = days; i > 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    values.push({
      date: { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() },
      value: String(Math.floor(Math.random() * (max - min + 1)) + min),
    })
  }
  return values
}

function makeMockInsights(branch: GBPBranch, days: number): GBPInsightsResponse {
  const multiplier = branch === 'cochin' ? 1.3 : 1.0 // Cochin slightly busier

  const metrics: { metric: GBPMetric; min: number; max: number }[] = [
    { metric: 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS', min: 15, max: 45 },
    { metric: 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', min: 30, max: 80 },
    { metric: 'BUSINESS_IMPRESSIONS_MOBILE_MAPS', min: 40, max: 120 },
    { metric: 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH', min: 50, max: 150 },
    { metric: 'CALL_CLICKS', min: 2, max: 10 },
    { metric: 'DIRECTION_REQUESTS', min: 3, max: 15 },
    { metric: 'WEBSITE_CLICKS', min: 5, max: 25 },
  ]

  return {
    multiDailyMetricTimeSeries: metrics.map(m => ({
      dailyMetric: m.metric,
      dailySubEntityType: undefined,
      timeSeries: {
        datedValues: generateDailyValues(
          days,
          Math.floor(m.min * multiplier),
          Math.floor(m.max * multiplier),
        ),
      },
    })),
  }
}

// ── Public API (matches gbpService shape) ────────────────────────────────
export const mockGBP = {
  getLocation(branch: GBPBranch): GBPLocation {
    return MOCK_LOCATIONS[branch]
  },

  getReviews(branch: GBPBranch): GBPReviewsResponse {
    const reviews = makeMockReviews(branch)
    const total = reviews.reduce((s, r) => s + ({ ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[r.starRating]), 0)
    return {
      reviews,
      averageRating: parseFloat((total / reviews.length).toFixed(1)),
      totalReviewCount: reviews.length,
    }
  },

  getPosts(branch: GBPBranch): { localPosts: GBPLocalPost[] } {
    return { localPosts: makeMockPosts(branch) }
  },

  getQuestions(branch: GBPBranch): GBPQuestionsResponse {
    const questions = makeMockQuestions(branch)
    return { questions, totalSize: questions.length }
  },

  getInsights(branch: GBPBranch, days = 28): GBPInsightsResponse {
    return makeMockInsights(branch, days)
  },
}

/** Check if error is GBP API quota/approval issue */
export function isGBPQuotaError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    return msg.includes('429') || msg.includes('quota') || msg.includes('rate') ||
      msg.includes('non-json') || msg.includes('gbp api error') || msg.includes('gbp proxy')
  }
  return false
}
