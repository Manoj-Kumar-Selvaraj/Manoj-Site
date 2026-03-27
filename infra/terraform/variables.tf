# ── AWS ─────────────────────────────────────────────────────────────────────
variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment tag"
  type        = string
  default     = "production"
}

variable "project" {
  description = "Project name used in resource naming and tagging"
  type        = string
  default     = "portfolio"
}

# ── EC2 ──────────────────────────────────────────────────────────────────────
variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ec2_ami_id" {
  description = "Pinned AMI ID for EC2 instance. Change intentionally to roll instance image."
  type        = string
  default     = "ami-00de3875b03809ec5"
}

variable "ec2_public_key" {
  description = "SSH public key content to provision on EC2 (paste the .pub contents)"
  type        = string
  sensitive   = true
}

variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH into the EC2 instance. Restrict to your IP."
  type        = list(string)
  default     = ["0.0.0.0/0"] # Override with your IP: ["x.x.x.x/32"]
}

variable "django_secret_key" {
  description = "Django SECRET_KEY for the production deployment"
  type        = string
  sensitive   = true
}

variable "django_allowed_hosts" {
  description = "Comma-separated list of Django ALLOWED_HOSTS (added after EC2 IP is known)"
  type        = string
  default     = "localhost,127.0.0.1"
}

variable "github_repo_url" {
  description = "GitHub HTTPS URL to clone (e.g. https://github.com/yourname/portfolio.git)"
  type        = string
}

# ── S3 ───────────────────────────────────────────────────────────────────────
variable "frontend_bucket_name" {
  description = "Globally unique S3 bucket name for the React frontend build"
  type        = string
}

variable "media_bucket_name" {
  description = "Globally unique S3 bucket name for Django media uploads"
  type        = string
}

# ── CloudFront ───────────────────────────────────────────────────────────────
variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_200 recommended for India/Asia audiences)"
  type        = string
  default     = "PriceClass_200"

  validation {
    condition     = contains(["PriceClass_All", "PriceClass_200", "PriceClass_100"], var.cloudfront_price_class)
    error_message = "Must be one of: PriceClass_All, PriceClass_200, PriceClass_100."
  }
}

variable "domain_name" {
  description = "Optional custom domain (leave empty to use CloudFront default domain)"
  type        = string
  default     = ""
}

variable "create_hosted_zone" {
  description = "When true and domain_name is set, Terraform will create a public Route 53 hosted zone for the domain. You must still update your registrar nameservers to the zone's name_servers output."
  type        = bool
  default     = false
}

variable "hosted_zone_id" {
  description = "Existing Route 53 hosted zone ID for your domain (e.g. Z1PA6795UKMFR9). Used when create_hosted_zone=false."
  type        = string
  default     = ""
}

# ── GitHub ───────────────────────────────────────────────────────────────────
variable "github_token" {
  description = "GitHub personal access token with repo + admin:repo_hook scopes for branch protection"
  type        = string
  sensitive   = true
}

variable "github_owner" {
  description = "GitHub username or organization that owns the repo"
  type        = string
}

variable "github_repo_name" {
  description = "GitHub repository name (just the name, not full path)"
  type        = string
  default     = "portfolio"
}
