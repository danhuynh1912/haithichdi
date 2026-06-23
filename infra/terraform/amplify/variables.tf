variable "aws_region" {
  description = "AWS region for the Amplify app."
  type        = string
}

variable "app_name" {
  description = "Name of the Amplify app."
  type        = string
}

variable "app_description" {
  description = "Optional description for the Amplify app."
  type        = string
  default     = "Next.js frontend deployed with AWS Amplify and managed by Terraform."
}

variable "repository_url" {
  description = "Git repository URL for the frontend app."
  type        = string
}

variable "repository_access_token" {
  description = "GitHub personal access token used by Amplify to connect the repository. Export as TF_VAR_repository_access_token for the first apply."
  type        = string
  default     = null
  sensitive   = true
  nullable    = true
}

variable "branch_name" {
  description = "Git branch Amplify should deploy."
  type        = string
}

variable "branch_stage" {
  description = "Amplify branch stage."
  type        = string
  default     = "PRODUCTION"

  validation {
    condition = contains(
      ["PRODUCTION", "BETA", "DEVELOPMENT", "EXPERIMENTAL", "PULL_REQUEST"],
      var.branch_stage,
    )
    error_message = "branch_stage must be one of PRODUCTION, BETA, DEVELOPMENT, EXPERIMENTAL, or PULL_REQUEST."
  }
}

variable "branch_ttl" {
  description = "Cache TTL in seconds for the Amplify branch."
  type        = string
  default     = "0"
}

variable "next_public_api_base_url" {
  description = "Public API base URL used by browser-side requests."
  type        = string
}

variable "server_api_base_url" {
  description = "API base URL used by Next.js server-side metadata fetches."
  type        = string
}

variable "next_public_site_url" {
  description = "Canonical public site URL used for SEO metadata."
  type        = string
}

variable "next_public_media_base_url" {
  description = "Optional media host allow-list for next/image."
  type        = string
  default     = null
  nullable    = true
}

variable "app_environment_variables" {
  description = "Optional app-level Amplify environment variables shared by all branches."
  type        = map(string)
  default     = {}
}

variable "additional_branch_environment_variables" {
  description = "Additional branch-level environment variables."
  type        = map(string)
  default     = {}
}

variable "iam_service_role_arn" {
  description = "Optional Amplify IAM service role ARN."
  type        = string
  default     = null
  nullable    = true
}

variable "compute_role_arn" {
  description = "Optional Amplify SSR compute role ARN."
  type        = string
  default     = null
  nullable    = true
}

variable "enable_branch_auto_deletion" {
  description = "Whether Amplify should disconnect deleted Git branches automatically."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags applied to all Terraform-managed Amplify resources."
  type        = map(string)
  default     = {}
}
