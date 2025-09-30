# Description: Defines the input variables for the Application Load Balancer module.

variable "project_name" {
  description = "The name of the project."
  type        = string
}

variable "environment" {
  description = "The deployment environment."
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC where the ALB will be deployed."
  type        = string
}

variable "public_subnet_ids" {
  description = "A list of public subnet IDs for the ALB."
  type        = any
}
variable "vpc_public_route_table_association_ids" {
  description = "A list of the public subnet route table association IDs to depend on."
  type        = list(string)
}