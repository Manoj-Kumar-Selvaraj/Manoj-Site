terraform {
  required_version = ">= 1.6.0"

  # ── Terraform Cloud backend ──────────────────────────────────────────────
  # State storage, locking, remote execution all handled by TFC.
  # No S3 buckets or DynamoDB tables to bootstrap.
  #
  # Setup (one-time):
  #   1. Create a TFC account at https://app.terraform.io
  #   2. Create an organization (free tier works fine)
  #   3. Create a workspace named "portfolio" with:
  #        - Execution Mode: Remote
  #        - Apply Method:   Auto apply  (GH Environment gate is the approval step)
  #   4. Add workspace variables (Settings → Variables):
  #        Terraform variables (sensitive):
  #          ec2_public_key         = <your SSH public key>
  #          django_secret_key      = <python -c "import secrets; print(secrets.token_hex(32))">
  #          django_allowed_hosts   = <EC2-IP>,<your-domain.com>
  #          github_token           = <GitHub PAT: repo + admin:repo_hook>
  #          github_repo_url        = https://github.com/<owner>/<repo>.git
  #        Terraform variables (non-sensitive):
  #          aws_region             = us-east-1
  #          github_owner           = <your GitHub username>
  #          github_repo_name       = portfolio
  #          frontend_bucket_name   = portfolio-frontend
  #          media_bucket_name      = portfolio-media
  #          ec2_instance_type      = t3.micro
  #        Environment variables (sensitive — for AWS provider auth):
  #          AWS_ACCESS_KEY_ID      = <IAM key for Terraform, NOT the CI/CD user>
  #          AWS_SECRET_ACCESS_KEY  = <IAM secret>
  #          AWS_DEFAULT_REGION     = us-east-1
  #   5. Generate a TFC API token: User Settings → Tokens → Create API token
  #   6. Add TF_API_TOKEN to GitHub Secrets (the only TF-related GitHub Secret needed)
  cloud {
    organization = "YOUR_TFC_ORG_NAME"   # replace with your TFC org

    workspaces {
      name = "portfolio"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.2"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}
