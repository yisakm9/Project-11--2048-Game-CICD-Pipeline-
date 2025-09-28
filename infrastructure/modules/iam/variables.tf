# Description: Defines the input variables for the IAM module.

variable "project_name" {
  description = "The name of the project."
  type        = string
}

variable "environment" {
  description = "The deployment environment."
  type        = string
}

variable "aws_account_id" {
  description = "The AWS Account ID."
  type        = string
}

variable "aws_region" {
  description = "The AWS Region."
  type        = string
}