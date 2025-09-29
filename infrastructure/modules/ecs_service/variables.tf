# Description: Defines the input variables for the ECS Service module.

variable "project_name" {
  description = "The name of the project."
  type        = string
}

variable "environment" {
  description = "The deployment environment."
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC."
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for the ECS tasks."
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "The ID of the Application Load Balancer's security group."
  type        = string
}

variable "main_target_group_arn" {
  description = "The ARN of the main ALB Target Group."
  type        = string
}

variable "ecs_task_execution_role_arn" {
  description = "The ARN of the ECS Task Execution Role."
  type        = string
}

variable "ecr_repository_url" {
  description = "The URL of the ECR repository for the application image."
  type        = string
}

variable "container_port" {
  description = "The port the container listens on."
  type        = number
  default     = 80
}

variable "desired_task_count" {
  description = "The desired number of tasks to run for the service."
  type        = number
  default     = 2 # Start with 2 for high availability
}