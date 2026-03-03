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
    deletion            = true # Prevent branch deletion
    non_fast_forward    = true # Prevent force pushes
    required_signatures = true

    pull_request {
      required_approving_review_count   = 1
      dismiss_stale_reviews_on_push     = true
      require_last_push_approval        = true
      required_review_thread_resolution = true
    }

    required_status_checks {
      strict_required_status_checks_policy = true # Branch must be up to date

      required_check {
        context        = "PR Checks / Secret Scan (Gitleaks)"
        integration_id = 15368 # GitHub Actions app ID
      }
      required_check {
        context        = "PR Checks / Terraform Checks"
        integration_id = 15368
      }
      required_check {
        context        = "PR Checks / App Build Check"
        integration_id = 15368
      }
      required_check {
        context        = "PR Checks / Infracost Cost Estimate"
        integration_id = 15368
      }
      required_check {
        context        = "Budget Gate / Monthly AWS Cost Check"
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
      required_approving_review_count = 1
      dismiss_stale_reviews_on_push   = true
    }
  }
}

# ── Repository data source ────────────────────────────────────────────────────
data "github_repository" "portfolio" {
  name = var.github_repo_name
}
