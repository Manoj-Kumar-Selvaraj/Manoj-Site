# ── GitHub Actions OIDC Provider ─────────────────────────────────────────────
# Registers GitHub's OIDC issuer with AWS so GitHub Actions can exchange a
# short-lived OIDC token for temporary AWS credentials — no long-lived keys.
resource "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"

  # sts.amazonaws.com is the audience GitHub Actions requests
  client_id_list = ["sts.amazonaws.com"]

  # GitHub's OIDC leaf-certificate thumbprints.
  # AWS auto-fetches these but Terraform requires at least one value.
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}

# ── GitHub Actions IAM Role ───────────────────────────────────────────────────
# Only tokens issued for THIS repo's "production" GitHub Environment can
# assume this role (enforced in the StringLike condition below).
resource "aws_iam_role" "github_actions" {
  name        = "${var.project}-github-actions-role"
  description = "Assumed by GitHub Actions via OIDC — no long-lived credentials stored"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "GitHubActionsOIDC"
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github_actions.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            # Must match the audience in the workflow's configure-aws-credentials step
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            # Restrict to this repo's production environment.
            # Workflows must declare `environment: production` to assume this role.
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_owner}/${var.github_repo_name}:environment:production"
          }
        }
      }
    ]
  })
}

# ── CI/CD Policy ─────────────────────────────────────────────────────────────
resource "aws_iam_policy" "cicd" {
  name        = "${var.project}-cicd-policy"
  description = "Least-privilege policy for GitHub Actions CI/CD pipeline"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # S3: frontend bucket — sync (read + write + delete)
      {
        Sid    = "FrontendS3Sync"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = [
          aws_s3_bucket.frontend.arn,
          "${aws_s3_bucket.frontend.arn}/*"
        ]
      },
      # S3: media bucket — write (Django uploads from EC2)
      {
        Sid    = "MediaS3Write"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.media.arn,
          "${aws_s3_bucket.media.arn}/*"
        ]
      },
      # CloudFront: cache invalidation only
      {
        Sid    = "CloudFrontInvalidation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetDistribution",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = aws_cloudfront_distribution.frontend.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_actions" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.cicd.arn
}

# ── EC2 Instance Role (S3 media access via instance metadata) ─────────────────
# The EC2 instance uses this role to read/write the media S3 bucket.
# Django's boto3 picks up credentials automatically from instance metadata —
# no long-lived keys are stored on the server.
resource "aws_iam_role" "ec2_instance" {
  name        = "${var.project}-ec2-role"
  description = "Assumed by the portfolio EC2 instance for S3 media access"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "ec2_media_s3" {
  name = "${var.project}-ec2-media-s3"
  role = aws_iam_role.ec2_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "MediaS3Access"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = [
          aws_s3_bucket.media.arn,
          "${aws_s3_bucket.media.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_instance" {
  name = "${var.project}-ec2-instance-profile"
  role = aws_iam_role.ec2_instance.name
}
