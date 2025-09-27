# Description: Defines the input variables for the VPC module.

variable "project_name" {
  description = "The name of the project, used to prefix resource names for clarity."
  type        = string
  validation {
    condition     = length(var.project_name) > 0 && can(regex("^[a-zA-Z0-9-]+$", var.project_name))
    error_message = "The project_name must be a non-empty string containing only letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "The deployment environment (e.g., 'dev', 'staging', 'prod')."
  type        = string
  validation {
    condition     = can(regex("^[a-z]{2,8}$", var.environment))
    error_message = "The environment must be a short, lowercase string (2-8 characters)."
  }
}

variable "vpc_cidr_block" {
  description = "The primary CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "A list of Availability Zones to deploy resources into."
  type        = list(string)
  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "The VPC must span at least two Availability Zones for high availability."
  }
}

variable "public_subnet_cidr_blocks" {
  description = "A list of CIDR blocks for the public subnets."
  type        = list(string)
}

variable "private_subnet_cidr_blocks" {
  description = "A list of CIDR blocks for the private subnets."
  type        = list(string)
}