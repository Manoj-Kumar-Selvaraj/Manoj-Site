# ── Repository Rulesets ────────────────────────────────────────────────────────
# Using github_repository_ruleset (REST API) instead of github_branch_protection
# (GraphQL) — avoids the read:org scope requirement on personal repositories.

# ── Ruleset — main branch ─────────────────────────────────────────────────────
resource "github_repository_ruleset" "main" {
  name        = "main-protection"
  repository  = data.github_repository.portfolio.name
  target      = "branch"
  enforcement = "active" # No bypass actors = enforced for everyone, including admins

  conditions {
    ref_name {
      include = ["refs/heads/main"]
      exclude = []
    }
  }

  rules {
    deletion         = true # Prevent branch deletion
    non_fast_forward = true # Prevent force pushes

    pull_request {
      required_approving_review_count   = 0
      dismiss_stale_reviews_on_push     = true
      require_last_push_approval        = false
      required_review_thread_resolution = false
    }

    required_status_checks {
      # Keep checks mandatory, but don't require the PR branch to be perfectly
      # up-to-date with `main` (strict mode frequently leaves checks "Expected"
      # and blocks merges for solo-dev workflows).
      strict_required_status_checks_policy = false

      # integration_id 15368 = GitHub Actions app — required so the ruleset can
      # match checks reported by GitHub Actions workflows to these requirements.
      required_check {
        context        = "PR Checks / Secret Scan (Gitleaks) (pull_request)"
        integration_id = 15368
      }
      required_check {
        context        = "PR Checks / Terraform Checks (pull_request)"
        integration_id = 15368
      }
      required_check {
        context        = "PR Checks / App Build Check (pull_request)"
        integration_id = 15368
      }
      required_check {
        context        = "PR Checks / App Health Check (pull_request)"
        integration_id = 15368
      }
      required_check {
        context        = "PR Checks / Infracost Cost Estimate (pull_request)"
        integration_id = 15368
      }
      required_check {
        context        = "PR Checks / Security Scan (Trivy) (pull_request)"
        integration_id = 15368
      }
      required_check {
        context        = "Budget Gate / Monthly AWS Cost Check (pull_request)"
        integration_id = 15368
      }
    }
  }
}

# ── Ruleset — release branches ────────────────────────────────────────────────
resource "github_repository_ruleset" "release" {
  name        = "release-protection"
  repository  = data.github_repository.portfolio.name
  target      = "branch"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["refs/heads/release/*"]
      exclude = []
    }
  }

  rules {
    deletion         = true
    non_fast_forward = true

    pull_request {
      required_approving_review_count = 0
      dismiss_stale_reviews_on_push   = true
    }
  }
}

# ── Repository data source ────────────────────────────────────────────────────
data "github_repository" "portfolio" {
  name = var.github_repo_name
}
