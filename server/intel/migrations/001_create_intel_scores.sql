CREATE TABLE IF NOT EXISTS intel_scores (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    pub_date INTEGER,
    score REAL NOT NULL,
    summary TEXT,
    reason TEXT,
    scored_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scores_score ON intel_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_created ON intel_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scores_source ON intel_scores(source_id);
