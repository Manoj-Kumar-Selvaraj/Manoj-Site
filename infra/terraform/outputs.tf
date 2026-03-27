output "cloudfront_domain" {
  description = "CloudFront distribution domain name — this is your frontend URL (before custom domain is set up)"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "frontend_url" {
  description = "Live frontend URL — custom domain when configured, otherwise CloudFront default domain"
  value       = local.dns_enabled ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "route53_hosted_zone_id" {
  description = "Route 53 hosted zone id used for the custom domain (created or provided). Empty when custom domain is disabled."
  value       = local.dns_enabled ? local.hosted_zone_id_effective : ""
}

output "route53_name_servers" {
  description = "Nameservers for the Terraform-created hosted zone (set these at your domain registrar). Empty when create_hosted_zone=false."
  value       = var.create_hosted_zone && local.dns_enabled ? aws_route53_zone.public[0].name_servers : []
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — set as CLOUDFRONT_DISTRIBUTION_ID in GitHub Secrets"
  value       = aws_cloudfront_distribution.frontend.id
}

output "ec2_public_ip" {
  description = "EC2 Elastic IP — set as EC2_HOST in GitHub Secrets (SSH target / backend origin)"
  value       = aws_eip.portfolio.public_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.portfolio.id
}

output "frontend_bucket_name" {
  description = "S3 bucket for React build — set as S3_BUCKET_FRONTEND in GitHub Secrets"
  value       = aws_s3_bucket.frontend.bucket
}

output "media_bucket_name" {
  description = "S3 bucket for Django media uploads — set as S3_BUCKET_MEDIA in GitHub Secrets"
  value       = aws_s3_bucket.media.bucket
}

output "db_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.portfolio.address
}

output "db_port" {
  description = "RDS PostgreSQL port"
  value       = aws_db_instance.portfolio.port
}

output "db_name" {
  description = "RDS PostgreSQL database name"
  value       = aws_db_instance.portfolio.db_name
}

output "db_username" {
  description = "RDS PostgreSQL username"
  value       = aws_db_instance.portfolio.username
}

output "budget_check_role_arn" {
  description = "IAM Role ARN for budget-check PR workflow — set as AWS_BUDGET_ROLE_ARN in GitHub Secrets"
  value       = aws_iam_role.budget_check.arn
}

output "github_actions_role_arn" {
  description = "IAM Role ARN for GitHub Actions OIDC — set as AWS_ROLE_ARN in GitHub Secrets"
  value       = aws_iam_role.github_actions.arn
}

output "django_admin_url" {
  description = "Django admin portal URL"
  value       = local.dns_enabled ? "https://${var.domain_name}/admin/" : "https://${aws_cloudfront_distribution.frontend.domain_name}/admin/"
}

output "api_base_url" {
  description = "Backend API base URL for direct troubleshooting (the frontend deploy uses same-origin /api in production)"
  value       = local.dns_enabled ? "https://${var.domain_name}/api" : "https://${aws_cloudfront_distribution.frontend.domain_name}/api"
}

output "github_secrets_summary" {
  description = "All values you need to add as GitHub Secrets"
  value       = <<-EOT
    ┌─────────────────────────────────────────────────────────────────────┐
    │  GitHub Secrets to configure                                        │
    ├──────────────────────────────────────┬──────────────────────────────┤
    │  AWS_ROLE_ARN                        │  ${aws_iam_role.github_actions.arn}
    │  AWS_BUDGET_ROLE_ARN                 │  ${aws_iam_role.budget_check.arn}
    │  AWS_REGION                          │  ${var.aws_region}
    │  S3_BUCKET_FRONTEND                  │  ${aws_s3_bucket.frontend.bucket}
    │  S3_BUCKET_MEDIA                     │  ${aws_s3_bucket.media.bucket}
    │  CLOUDFRONT_DISTRIBUTION_ID          │  ${aws_cloudfront_distribution.frontend.id}
    │  CLOUDFRONT_DOMAIN                   │  ${local.dns_enabled ? var.domain_name : aws_cloudfront_distribution.frontend.domain_name}
    │  EC2_HOST                            │  ${aws_eip.portfolio.public_ip}
    │  DB_HOST                             │  ${aws_db_instance.portfolio.address}
    │  DB_PORT                             │  ${aws_db_instance.portfolio.port}
    │  DB_NAME                             │  ${aws_db_instance.portfolio.db_name}
    │  DB_USER                             │  ${aws_db_instance.portfolio.username}
    │  API_BASE_URL (optional debug only)  │  ${local.dns_enabled ? "https://${var.domain_name}/api" : "https://${aws_cloudfront_distribution.frontend.domain_name}/api"}
    │  (EC2_SSH_KEY            — your private key, never stored in TF)
    │  (DJANGO_SECRET_KEY      — your Django secret key)
    │  (DB_PASSWORD            — your RDS password)
    │  (TF_API_TOKEN           — Terraform Cloud token)
    └─────────────────────────────────────────────────────────────────────┘
  EOT
}
