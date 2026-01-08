You are analyzing your own tweet performance.
Tweet: "{{TWEET_TEXT}}"
Metrics:
- likes: {{LIKES}}
- reposts: {{REPOSTS}}
- replies: {{REPLIES}}

Task:
1) Determine what worked.
2) Determine what failed.
3) Extract 1 "success pattern" rule and 1 "avoid pattern" rule.
4) Keep each rule short and actionable.

Return JSON:
{
  "success_pattern": "...",
  "avoid_pattern": "...",
  "notes": "..."
}
