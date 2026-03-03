provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Provider alias required for ACM certificates used by CloudFront.
# CloudFront only accepts certificates issued in us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

provider "github" {
  token = var.github_token
  owner = var.github_owner
}

# Random suffix to ensure globally unique bucket names
resource "random_id" "suffix" {
  byte_length = 4
}
