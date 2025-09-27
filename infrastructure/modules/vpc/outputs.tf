# Description: Declares the outputs from the VPC module.

output "vpc_id" {
  description = "The ID of the created VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "A list of IDs for the public subnets."
  value       = aws_subnet.public.*.id
}

output "private_subnet_ids" {
  description = "A list of IDs for the private subnets."
  value       = aws_subnet.private.*.id
}

output "availability_zones" {
  description = "The availability zones used by the VPC."
  value       = var.availability_zones
}