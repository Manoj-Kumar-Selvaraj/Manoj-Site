# ── Origin Access Control (OAC) — modern replacement for OAI ─────────────────
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project}-frontend-oac"
  description                       = "OAC for portfolio frontend S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ── CloudFront Distribution ───────────────────────────────────────────────────
resource "aws_cloudfront_distribution" "frontend" {
  comment             = "${var.project} frontend distribution"
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = var.cloudfront_price_class
  wait_for_deployment = false

  # S3 origin (private, via OAC)
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3FrontendOrigin"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # Default cache behaviour — serve React SPA
  default_cache_behavior {
    target_origin_id       = "S3FrontendOrigin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    # Assets with hash in name: cache 1 year
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  # SPA routing: return index.html for 403/404 so React Router handles the path
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  # Geo restrictions — none
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Custom domain aliases — empty list means CloudFront's own domain is used
  aliases = var.domain_name != "" ? [var.domain_name] : []

  viewer_certificate {
    # When a custom ACM cert is provided use it; otherwise fall back to the
    # default *.cloudfront.net certificate (null fields are ignored by AWS).
    acm_certificate_arn            = var.acm_certificate_arn != "" ? var.acm_certificate_arn : null
    ssl_support_method             = var.acm_certificate_arn != "" ? "sni-only" : null
    minimum_protocol_version       = var.acm_certificate_arn != "" ? "TLSv1.2_2021" : "TLSv1"
    cloudfront_default_certificate = var.acm_certificate_arn == "" ? true : false
  }

  tags = {
    Name = "${var.project}-cloudfront"
  }
}
