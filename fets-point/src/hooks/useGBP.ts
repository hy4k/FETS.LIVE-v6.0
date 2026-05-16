// useGBP - React hooks for Google Business Profile data
// Falls back to demo data when GBP API quota is not approved

import { useState, useEffect, useCallback } from 'react'
import type { GBPBranch, GBPReview, GBPLocalPost, GBPQuestion, GBPInsightsResponse, GBPLocationSummary } from '../types/gbp.types'
import {
  gbpReviewsService,
  gbpPostsService,
  gbpQAService,
  gbpInsightsService,
  gbpLocationService,
} from '../lib/gbpService'
import { mockGBP, isGBPQuotaError } from '../lib/gbpMockData'

// Global flag: once we detect API quota issue, skip live calls for rest of session
let gbpDemoMode = false

export function useGBPDemoMode() {
  return gbpDemoMode
}

// ── useGBPReviews ─────────────────────────────────────────────────────────
export function useGBPReviews(branch: GBPBranch) {
  const [reviews, setReviews] = useState<GBPReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextPageToken, setNextPageToken] = useState<string | undefined>()
  const [isDemo, setIsDemo] = useState(false)

  const fetchReviews = useCallback(async (pageToken?: string) => {
    setLoading(true)
    setError(null)
    try {
      if (gbpDemoMode) throw new Error('demo-mode')
      const res = await gbpReviewsService.listReviews(branch, pageToken)
      setReviews(prev => pageToken ? [...prev, ...(res.reviews ?? [])] : (res.reviews ?? []))
      setAverageRating(res.averageRating ?? 0)
      setTotalCount(res.totalReviewCount ?? 0)
      setNextPageToken(res.nextPageToken)
      setIsDemo(false)
    } catch (e) {
      if (isGBPQuotaError(e) || (e instanceof Error && e.message === 'demo-mode')) {
        gbpDemoMode = true
        const mock = mockGBP.getReviews(branch)
        setReviews(mock.reviews ?? [])
        setAverageRating(mock.averageRating ?? 0)
        setTotalCount(mock.totalReviewCount ?? 0)
        setNextPageToken(undefined)
        setIsDemo(true)
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load reviews')
      }
    } finally {
      setLoading(false)
    }
  }, [branch])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const replyToReview = useCallback(async (reviewName: string, comment: string) => {
    if (gbpDemoMode) {
      // In demo mode, update locally only
      setReviews(prev => prev.map(r => r.name === reviewName ? { ...r, reviewReply: { comment } } : r))
      return
    }
    const updated = await gbpReviewsService.replyToReview(branch, reviewName, comment)
    setReviews(prev => prev.map(r => r.name === reviewName ? { ...r, reviewReply: { comment } } : r))
    return updated
  }, [branch])

  const deleteReply = useCallback(async (reviewName: string) => {
    if (gbpDemoMode) {
      setReviews(prev => prev.map(r => r.name === reviewName ? { ...r, reviewReply: undefined } : r))
      return
    }
    await gbpReviewsService.deleteReply(branch, reviewName)
    setReviews(prev => prev.map(r => r.name === reviewName ? { ...r, reviewReply: undefined } : r))
  }, [branch])

  return { reviews, averageRating, totalCount, loading, error, nextPageToken, fetchReviews, replyToReview, deleteReply, isDemo }
}

// ── useGBPSummary (for dashboard widgets) ────────────────────────────────
export function useGBPSummary() {
  const [summaries, setSummaries] = useState<GBPLocationSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (gbpDemoMode) throw new Error('demo-mode')
      const [cochin, calicut] = await Promise.allSettled([
        gbpReviewsService.getLocationSummary('cochin'),
        gbpReviewsService.getLocationSummary('calicut'),
      ])
      const results: GBPLocationSummary[] = []
      if (cochin.status === 'fulfilled') results.push(cochin.value)
      if (calicut.status === 'fulfilled') results.push(calicut.value)

      // If both failed, switch to demo
      if (results.length === 0) throw new Error('demo-mode')
      setSummaries(results)
    } catch (e) {
      if (isGBPQuotaError(e) || (e instanceof Error && e.message === 'demo-mode')) {
        gbpDemoMode = true
        // Build summaries from mock data
        const mockSummaries: GBPLocationSummary[] = (['cochin', 'calicut'] as GBPBranch[]).map(branch => {
          const reviewData = mockGBP.getReviews(branch)
          const reviews = reviewData.reviews ?? []
          return {
            branch,
            label: branch === 'cochin' ? 'FETS Cochin' : 'FETS Calicut',
            location: mockGBP.getLocation(branch),
            reviewCount: reviewData.totalReviewCount ?? reviews.length,
            averageRating: reviewData.averageRating ?? 0,
            recentReviews: reviews.slice(0, 5),
            unrepliedCount: reviews.filter(r => !r.reviewReply).length,
          }
        })
        setSummaries(mockSummaries)
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load GBP summaries')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { summaries, loading, error, refresh }
}

// ── useGBPPosts ────────────────────────────────────────────────────────────
export function useGBPPosts(branch: GBPBranch) {
  const [posts, setPosts] = useState<GBPLocalPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (gbpDemoMode) throw new Error('demo-mode')
      const res = await gbpPostsService.listPosts(branch)
      setPosts(res.localPosts ?? [])
      setIsDemo(false)
    } catch (e) {
      if (isGBPQuotaError(e) || (e instanceof Error && e.message === 'demo-mode')) {
        gbpDemoMode = true
        setPosts(mockGBP.getPosts(branch).localPosts)
        setIsDemo(true)
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load posts')
      }
    } finally {
      setLoading(false)
    }
  }, [branch])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const createPost = useCallback(async (postData: Parameters<typeof gbpPostsService.createPost>[1]) => {
    setSubmitting(true)
    try {
      if (gbpDemoMode) {
        // In demo mode, add locally
        const fakePost: GBPLocalPost = {
          name: `locations/${branch}/posts/demo-${Date.now()}`,
          summary: postData.summary,
          topicType: postData.topicType,
          state: 'LIVE',
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
        }
        setPosts(prev => [fakePost, ...prev])
        return fakePost
      }
      const newPost = await gbpPostsService.createPost(branch, postData)
      setPosts(prev => [newPost, ...prev])
      return newPost
    } finally {
      setSubmitting(false)
    }
  }, [branch])

  const deletePost = useCallback(async (postName: string) => {
    if (gbpDemoMode) {
      setPosts(prev => prev.filter(p => p.name !== postName))
      return
    }
    await gbpPostsService.deletePost(branch, postName)
    setPosts(prev => prev.filter(p => p.name !== postName))
  }, [branch])

  return { posts, loading, error, submitting, fetchPosts, createPost, deletePost, isDemo }
}

// ── useGBPQA ────────────────────────────────────────────────────────────────
export function useGBPQA(branch: GBPBranch) {
  const [questions, setQuestions] = useState<GBPQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (gbpDemoMode) throw new Error('demo-mode')
      const res = await gbpQAService.listQuestions(branch)
      setQuestions(res.questions ?? [])
      setIsDemo(false)
    } catch (e) {
      if (isGBPQuotaError(e) || (e instanceof Error && e.message === 'demo-mode')) {
        gbpDemoMode = true
        setQuestions(mockGBP.getQuestions(branch).questions ?? [])
        setIsDemo(true)
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load Q&A')
      }
    } finally {
      setLoading(false)
    }
  }, [branch])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  const answerQuestion = useCallback(async (questionName: string, text: string) => {
    if (gbpDemoMode) {
      // Update locally in demo mode
      setQuestions(prev => prev.map(q => {
        if (q.name !== questionName) return q
        return {
          ...q,
          topAnswers: [{
            name: `${questionName}/answers/demo-${Date.now()}`,
            author: { displayName: 'FETS', type: 'MERCHANT' as const },
            upvoteCount: 0,
            text,
            createTime: new Date().toISOString(),
          }],
          totalAnswerCount: 1,
        }
      }))
      return
    }
    await gbpQAService.answerQuestion(branch, questionName, text)
    await fetchQuestions()
  }, [branch, fetchQuestions])

  return { questions, loading, error, fetchQuestions, answerQuestion, isDemo }
}

// ── useGBPInsights ─────────────────────────────────────────────────────────
export function useGBPInsights(branch: GBPBranch, startDate?: string, endDate?: string) {
  const [insights, setInsights] = useState<GBPInsightsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (gbpDemoMode) throw new Error('demo-mode')
      const res = await gbpInsightsService.getInsights(branch, startDate, endDate)
      setInsights(res)
      setIsDemo(false)
    } catch (e) {
      if (isGBPQuotaError(e) || (e instanceof Error && e.message === 'demo-mode')) {
        gbpDemoMode = true
        // Calculate days from date range
        let days = 28
        if (startDate && endDate) {
          days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
        }
        setInsights(mockGBP.getInsights(branch, days))
        setIsDemo(true)
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load insights')
      }
    } finally {
      setLoading(false)
    }
  }, [branch, startDate, endDate])

  useEffect(() => { fetchInsights() }, [fetchInsights])

  return { insights, loading, error, fetchInsights, isDemo }
}

// ── useGBP (for GBPDashboard header) ─────────────────────────────────────
interface GBPBusinessInfo {
  title?: string
  storefrontAddress?: { addressLines?: string[] }
  openInfo?: { status?: string }
  metadata?: { mapsUri?: string }
}

export function useGBP(branch: GBPBranch) {
  const [businessInfo, setBusinessInfo] = useState<GBPBusinessInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (gbpDemoMode) throw new Error('demo-mode')
        const loc = await gbpLocationService.getLocation(branch)
        if (cancelled) return
        setBusinessInfo({
          title: loc.title,
          storefrontAddress: { addressLines: [loc.phoneNumbers?.primaryPhone ?? ''] },
          openInfo: { status: 'OPEN' },
          metadata: { mapsUri: loc.websiteUri },
        })
        setIsDemo(false)
      } catch (e) {
        if (cancelled) return
        if (isGBPQuotaError(e) || (e instanceof Error && e.message === 'demo-mode')) {
          gbpDemoMode = true
          const loc = mockGBP.getLocation(branch)
          setBusinessInfo({
            title: loc.title,
            storefrontAddress: { addressLines: [loc.phoneNumbers?.primaryPhone ?? ''] },
            openInfo: { status: 'OPEN' },
            metadata: { mapsUri: loc.websiteUri },
          })
          setIsDemo(true)
        } else {
          setError(e instanceof Error ? e.message : 'Failed to load business info')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [branch])

  return { businessInfo, loading, error, isDemo }
}
