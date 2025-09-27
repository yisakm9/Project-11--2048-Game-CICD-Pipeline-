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