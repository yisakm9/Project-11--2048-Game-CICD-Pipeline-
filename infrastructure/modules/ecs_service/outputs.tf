# Description: Declares the outputs from the ECS Service module.

output "ecs_cluster_name" {
  description = "The name of the ECS cluster."
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "The name of the ECS service."
  value       = aws_ecs_service.main.name
}