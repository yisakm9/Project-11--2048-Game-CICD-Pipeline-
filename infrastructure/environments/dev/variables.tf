# Description: Input variables for the 'dev' environment root module.

variable "project_name" {
  description = "The name of the project."
  type        = string
}

variable "environment" {
  description = "The deployment environment."
  type        = string
}

variable "region" {
  description = "The AWS region to deploy infrastructure into."
  type        = string
}