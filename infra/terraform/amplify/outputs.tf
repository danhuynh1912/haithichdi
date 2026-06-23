output "amplify_app_id" {
  description = "Amplify app ID."
  value       = aws_amplify_app.this.id
}

output "amplify_app_arn" {
  description = "Amplify app ARN."
  value       = aws_amplify_app.this.arn
}

output "amplify_default_domain" {
  description = "Amplify default domain."
  value       = aws_amplify_app.this.default_domain
}

output "amplify_branch_name" {
  description = "Amplify branch name managed by Terraform."
  value       = aws_amplify_branch.this.branch_name
}

output "amplify_console_url" {
  description = "Amplify Console URL for the app."
  value       = "https://${var.aws_region}.console.aws.amazon.com/amplify/home?region=${var.aws_region}#/${aws_amplify_app.this.id}"
}
