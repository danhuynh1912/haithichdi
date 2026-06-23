resource "aws_amplify_app" "this" {
  name                        = var.app_name
  description                 = var.app_description
  repository                  = var.repository_url
  access_token                = var.repository_access_token
  platform                    = "WEB_COMPUTE"
  build_spec                  = file("${path.module}/../../../amplify.yml")
  enable_branch_auto_build    = false
  enable_branch_auto_deletion = var.enable_branch_auto_deletion
  iam_service_role_arn        = var.iam_service_role_arn
  compute_role_arn            = var.compute_role_arn
  environment_variables       = var.app_environment_variables

  cache_config {
    type = "AMPLIFY_MANAGED"
  }
}

resource "aws_amplify_branch" "this" {
  app_id                  = aws_amplify_app.this.id
  branch_name             = var.branch_name
  stage                   = var.branch_stage
  enable_auto_build       = true
  enable_performance_mode = false
  environment_variables   = local.branch_environment_variables
  ttl                     = var.branch_ttl
}
