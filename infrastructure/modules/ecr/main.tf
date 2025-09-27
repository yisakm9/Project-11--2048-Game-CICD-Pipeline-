# Description: Provisions a secure ECR repository for storing Docker images.

resource "aws_ecr_repository" "main" {
  name                 = var.repository_name
  image_tag_mutability = "IMMUTABLE" # Best practice: prevents overwriting tags like 'latest'

  image_scanning_configuration {
    scan_on_push = true # Best practice: automatically scans images for vulnerabilities
  }

  tags = {
    Name        = "${var.project_name}-ecr-${var.repository_name}-${var.environment}"
    Project     = var.project_name
    Environment = var.environment
  }
}