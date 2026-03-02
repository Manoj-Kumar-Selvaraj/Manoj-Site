plugin "aws" {
  enabled = true
  version = "0.31.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

# Enforce resource naming conventions
rule "terraform_naming_convention" {
  enabled = true

  custom {
    regex = "^[a-z][a-z0-9_]*$"
  }
}

# Disallow deprecated interpolations
rule "terraform_deprecated_interpolation" {
  enabled = true
}

# require all variables to have descriptions
rule "terraform_documented_variables" {
  enabled = true
}

# require all outputs to have descriptions
rule "terraform_documented_outputs" {
  enabled = true
}

# Warn on unused declarations
rule "terraform_unused_declarations" {
  enabled = true
}

# Required version constraint
rule "terraform_required_version" {
  enabled = true
}

# Required providers with version constraint
rule "terraform_required_providers" {
  enabled = true
}
