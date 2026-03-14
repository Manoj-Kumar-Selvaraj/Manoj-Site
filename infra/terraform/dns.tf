# ── DNS & TLS — custom domain via Route 53 + ACM ─────────────────────────────
# Set both `domain_name` and `hosted_zone_id` in terraform.tfvars to enable.
# When either is empty the stack works fine on the default CloudFront domain.

locals {
  dns_enabled = var.domain_name != "" && var.hosted_zone_id != ""
}

# ── ACM Certificate ───────────────────────────────────────────────────────────
# CloudFront requires its certificate in us-east-1 regardless of the main region.
resource "aws_acm_certificate" "frontend" {
  count    = local.dns_enabled ? 1 : 0
  provider = aws.us_east_1

  domain_name = var.domain_name
  # Cover apex + www with a single cert (CloudFront custom domain)
  subject_alternative_names = [
    "www.${var.domain_name}",
  ]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# ── ACM DNS validation records ────────────────────────────────────────────────
# Terraform iterates over every domain_validation_options entry (one per SAN)
# and creates the required CNAME records in Route 53.
resource "aws_route53_record" "cert_validation" {
  for_each = local.dns_enabled ? {
    for dvo in aws_acm_certificate.frontend[0].domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id         = var.hosted_zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true # safe to overwrite if cert is re-issued
}

# ── Wait for certificate validation ─────────────────────────────────────────
# Terraform blocks here until ACM reports the cert as ISSUED (usually <2 min).
resource "aws_acm_certificate_validation" "frontend" {
  count    = local.dns_enabled ? 1 : 0
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.frontend[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# ── Route 53: apex domain → CloudFront ────────────────────────────────────────
resource "aws_route53_record" "apex" {
  count   = local.dns_enabled ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

# ── Route 53: www → CloudFront ────────────────────────────────────────────────
resource "aws_route53_record" "www" {
  count   = local.dns_enabled ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}


