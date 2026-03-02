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

provider "github" {
  token = var.github_token
  owner = var.github_owner
}

# Random suffix to ensure globally unique bucket names
resource "random_id" "suffix" {
  byte_length = 4
}
