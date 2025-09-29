# --- Data Sources ---
# Retrieves the AWS Account ID dynamically.
data "aws_caller_identity" "current" {}
# --- Networking ---
# Instantiate the VPC module to create the network foundation.
module "vpc" {
  source = "../../modules/vpc" # Relative path to the VPC module

  project_name = var.project_name
  environment  = var.environment

  # Define the network topology for the dev environment
  availability_zones = ["${var.region}a", "${var.region}b"] # Spans two AZs for HA
  
  public_subnet_cidr_blocks = [
    "10.0.1.0/24",
    "10.0.2.0/24"
  ]
  private_subnet_cidr_blocks = [
    "10.0.101.0/24",
    "10.0.102.0/24"
  ]
}

module "ecr" {
  source = "../../modules/ecr"

  project_name    = var.project_name
  environment     = var.environment
  repository_name = "${var.project_name}-${var.environment}"
}

# --- Load Balancer ---
# Instantiate the ALB module to create the public entry point for the application.
module "alb" {
  source = "../../modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
}


# --- IAM ---
# Instantiate the IAM module to create the necessary roles for the ECS service.
module "iam" {
  source = "../../modules/iam"

  project_name   = var.project_name
  environment    = var.environment
  aws_account_id = data.aws_caller_identity.current.account_id
  aws_region     = var.region
}

# --- ECS Service ---
# Instantiate the ECS module to run our containerized application.
module "ecs_service" {
  source = "../../modules/ecs_service"

  project_name                  = var.project_name
  environment                   = var.environment
  vpc_id                        = module.vpc.vpc_id
  private_subnet_ids            = module.vpc.private_subnet_ids
  alb_security_group_id         = module.alb.alb_security_group_id
  main_target_group_arn         = module.alb.main_target_group_arn
  ecs_task_execution_role_arn   = module.iam.ecs_task_execution_role_arn
  ecr_repository_url            = module.ecr.repository_url
}