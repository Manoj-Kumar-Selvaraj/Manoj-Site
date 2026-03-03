# ── Branch Protection — main branch ──────────────────────────────────────────
# enforce_admins = true ensures even repository admins cannot bypass protections
resource "github_branch_protection" "main" {
  repository_id = data.github_repository.portfolio.node_id
  pattern       = "main"

  # No one can push directly to main — all changes must go through PRs
  enforce_admins                  = true
  require_signed_commits          = true
  require_conversation_resolution = true
  allows_deletions                = false
  allows_force_pushes             = false
  lock_branch                     = false

  required_status_checks {
    strict = true # Branch must be up to date before merging
    contexts = [
      # These must exactly match the `name:` field of each job in pr-checks.yml
      "PR Checks / Secret Scan (Gitleaks)",
      "PR Checks / Terraform Checks",
      "PR Checks / App Build Check",
      "PR Checks / Infracost Cost Estimate",
      # budget-check.yml
      "Budget Gate / Monthly AWS Cost Check",
    ]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
    require_last_push_approval      = true
  }

  restrict_pushes {
    push_allowances = [] # No direct pushers — all via PR only
  }
}

# ── Branch Protection — release branches ─────────────────────────────────────
resource "github_branch_protection" "release" {
  repository_id = data.github_repository.portfolio.node_id
  pattern       = "release/*"

  enforce_admins      = true
  allows_deletions    = false
  allows_force_pushes = false

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
  }
}

# ── Repository data source ────────────────────────────────────────────────────
data "github_repository" "portfolio" {
  name = var.github_repo_name
}
