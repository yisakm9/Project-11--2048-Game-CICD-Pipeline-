# Description: Exposes the most important resource identifiers and endpoints for the 'dev' environment.

output "load_balancer_url" {
  description = "The public URL of the application load balancer. Access the 2048 game here once deployed."
  value       = "http://${module.alb.alb_dns_name}"
}

output "ecr_repository_url" {
  description = "The URL of the ECR repository where the application's Docker image should be pushed."
  value       = module.ecr.repository_url
}

output "ecs_cluster_name" {
  description = "The name of the provisioned ECS cluster."
  value       = module.ecs_service.ecs_cluster_name
}

output "ecs_service_name" {
  description = "The name of the provisioned ECS service."
  value       = module.ecs_service.ecs_service_name
}