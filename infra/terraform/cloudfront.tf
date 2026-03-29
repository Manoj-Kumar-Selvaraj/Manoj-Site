# ── Origin Access Control (OAC) — modern replacement for OAI ─────────────────
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project}-frontend-oac"
  description                       = "OAC for portfolio frontend S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "frontend_spa_rewrite" {
  name    = "${var.project}-frontend-spa-rewrite"
  runtime = "cloudfront-js-1.0"
  comment = "Rewrite SPA routes to index.html and serve favicon.svg for favicon.ico"
  publish = true

  code = <<-EOT
    function handler(event) {
      var request = event.request;
      var uri = request.uri || "/";

      if (uri === "/favicon.ico") {
        request.uri = "/favicon.svg";
        return request;
      }

      if (uri === "/" || uri.indexOf(".") !== -1) {
        return request;
      }

      request.uri = "/index.html";
      return request;
    }
  EOT
}

# trivy:ignore:AVD-AWS-0006  -- WAF omitted: AWS WAF costs ~$5/mo minimum which
#                               exceeds the entire budget for this portfolio. The
#                               default CloudFront rate-limiting provides baseline
#                               protection for a low-traffic personal site.
# trivy:ignore:AVD-AWS-0012  -- CloudFront access logging omitted: log delivery
#                               to S3 adds storage cost with no operational value
#                               at personal-portfolio scale.
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

  # EC2 origin — Django API (HTTP on port 80, CloudFront terminates TLS for viewers)
  origin {
    domain_name = aws_instance.portfolio.public_dns
    origin_id   = "EC2BackendOrigin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # S3 origin — public media bucket for uploaded images/files
  origin {
    domain_name = aws_s3_bucket.media.bucket_regional_domain_name
    origin_id   = "S3MediaOrigin"
  }

  # /api/* — proxy to Django backend (no caching, all methods, CORS-aware)
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "EC2BackendOrigin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = false

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Origin", "Content-Type", "Accept", "X-CSRFToken", "X-Forwarded-Proto"]
      cookies {
        forward = "all"
      }
    }

    # Never cache API responses
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  # /admin/* — proxy to Django admin (no caching)
  ordered_cache_behavior {
    path_pattern           = "/admin/*"
    target_origin_id       = "EC2BackendOrigin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = false

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Origin", "Content-Type", "Accept", "X-CSRFToken", "Host", "X-Forwarded-Proto"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  # /static/* — proxy to Django static files via EC2/nginx
  ordered_cache_behavior {
    path_pattern           = "/static/*"
    target_origin_id       = "EC2BackendOrigin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  # /media/* — serve uploaded media via S3 + CloudFront
  ordered_cache_behavior {
    path_pattern           = "/media/*"
    target_origin_id       = "S3MediaOrigin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  # Default cache behaviour — serve React SPA
  default_cache_behavior {
    target_origin_id       = "S3FrontendOrigin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.frontend_spa_rewrite.arn
    }

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

  # NOTE: CloudFront custom_error_response blocks were removed intentionally.
  # They apply globally across all behaviors/origins and can rewrite missing
  # /static/* assets to HTML, which breaks Django admin JS/CSS loading.

  # Geo restrictions — none
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Custom domain aliases — covers apex + www when a domain is configured
  aliases = local.dns_enabled ? [var.domain_name, "www.${var.domain_name}"] : []

  viewer_certificate {
    # Use the Terraform-managed, DNS-validated ACM cert when a domain is set;
    # fall back to the default *.cloudfront.net cert otherwise.
    acm_certificate_arn            = local.dns_enabled ? aws_acm_certificate_validation.frontend[0].certificate_arn : null
    ssl_support_method             = local.dns_enabled ? "sni-only" : null
    minimum_protocol_version       = local.dns_enabled ? "TLSv1.2_2021" : "TLSv1"
    cloudfront_default_certificate = local.dns_enabled ? false : true
  }

  tags = {
    Name = "${var.project}-cloudfront"
  }
}
