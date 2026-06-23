locals {
  required_branch_environment_variables = {
    NEXT_PUBLIC_API_BASE_URL = var.next_public_api_base_url
    SERVER_API_BASE_URL      = var.server_api_base_url
    NEXT_PUBLIC_SITE_URL     = var.next_public_site_url
  }

  optional_branch_environment_variables = var.next_public_media_base_url == null ? {} : {
    NEXT_PUBLIC_MEDIA_BASE_URL = var.next_public_media_base_url
  }

  branch_environment_variables = merge(
    local.required_branch_environment_variables,
    local.optional_branch_environment_variables,
    var.additional_branch_environment_variables,
  )
}
