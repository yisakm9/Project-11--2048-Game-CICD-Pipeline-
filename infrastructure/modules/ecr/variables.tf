# Description: Defines the input variables for the ECR module.

variable "project_name" {
  description = "The name of the project."
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g., 'dev')."
  type        = string
}

variable "repository_name" {
  description = "The name of the ECR repository."
  type        = string
}