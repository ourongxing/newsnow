export interface IntelItem {
  id: string
  source_id: string
  title: string
  url: string
  pub_date: number | null
  score: number
  summary: string | null
  reason: string | null
  scored_at: number
  created_at: number
}

export interface IntelResponse {
  items: IntelItem[]
  total: number
  has_more: boolean
  last_refreshed_at: number | null
}

export interface IntelScoringWeights {
  depth: number
  trend: number
  practical: number
}

export interface IntelConfig {
  sources: string[]
  scoring: {
    weights: IntelScoringWeights
    threshold: number
  }
  ai: {
    provider: string
    model: string
    batch_size: number
    max_tokens: number
  }
  cache: {
    ttl_minutes: number
    retention_days: number
  }
}
