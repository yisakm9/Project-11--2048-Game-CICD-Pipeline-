# Description: Provisions an ECS Cluster, Task Definition, and Fargate Service.

# --- Security Group for ECS Tasks ---
# Allows traffic from the ALB to the ECS tasks on the container port.
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-ecs-tasks-sg-${var.environment}"
  description = "Allow inbound traffic from ALB to ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    protocol        = "tcp"
    from_port       = var.container_port
    to_port         = var.container_port
    security_groups = [var.alb_security_group_id] # Only allows traffic from our ALB
    description     = "Allow traffic from ALB"
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ecs-tasks-sg-${var.environment}"
  }
}

# --- ECS Cluster ---
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster-${var.environment}"

  tags = {
    Name = "${var.project_name}-cluster-${var.environment}"
  }
}

# --- ECS Task Definition ---
# The blueprint for our application container.
resource "aws_ecs_task_definition" "main" {
  family                   = "${var.project_name}-task-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"  # 0.25 vCPU
  memory                   = "512"  # 512 MiB
  execution_role_arn       = var.ecs_task_execution_role_arn

  # The actual container definition
  container_definitions = jsonencode([
    {
      name      = "${var.project_name}-container-${var.environment}"
      image     = "${var.ecr_repository_url}:latest" # We will update this tag in the CI pipeline
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
        }
      ]
    }
  ])
}

# --- ECS Service ---
# Runs and maintains the desired number of tasks from the Task Definition.
resource "aws_ecs_service" "main" {
  name            = "${var.project_name}-service-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = var.desired_task_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  load_balancer {
    target_group_arn = var.main_target_group_arn
    container_name   = "${var.project_name}-container-${var.environment}"
    container_port   = var.container_port
  }

  # This ensures that the service waits for the ALB to be ready before starting.
  depends_on = [
    aws_lb_listener.http # Assuming the listener is created in the ALB module
  ]
}