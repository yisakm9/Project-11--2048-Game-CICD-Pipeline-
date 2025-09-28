# Description: Declares the outputs from the ALB module.

output "alb_dns_name" {
  description = "The DNS name of the ALB."
  value       = aws_lb.main.dns_name
}

output "alb_security_group_id" {
  description = "The ID of the ALB's security group."
  value       = aws_security_group.alb.id
}

output "main_target_group_arn" {
  description = "The ARN of the main target group."
  value       = aws_lb_target_group.main.arn
}