# Description: Provisions the IAM Role and Policies required for ECS Task Execution.

# --- IAM Role for ECS Task Execution ---
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-ecs-task-execution-role-${var.environment}"

  # Trust policy allowing the ECS Tasks service to assume this role
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
}

# --- Trust Policy Document ---
data "aws_iam_policy_document" "ecs_task_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# --- Attach the AWS Managed Policy ---
# This policy grants permissions to pull from ECR and send logs to CloudWatch.
resource "aws_iam_role_policy_attachment" "ecs_task_execution_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}