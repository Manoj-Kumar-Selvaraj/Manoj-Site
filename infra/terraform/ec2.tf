# trivy:ignore:AVD-AWS-0029  -- EC2 detailed monitoring intentionally disabled:
#                               CloudWatch detailed monitoring costs ~$3.50/mo
#                               per instance, which exceeds the budget for this
#                               personal portfolio. Basic monitoring is sufficient.

# ── SSH Key Pair ──────────────────────────────────────────────────────────────
resource "aws_key_pair" "portfolio" {
  key_name   = "${var.project}-key"
  public_key = var.ec2_public_key
}

# ── EC2 Instance ──────────────────────────────────────────────────────────────
resource "aws_instance" "portfolio" {
  # Pinned AMI prevents surprise replacement during routine apply operations.
  # Update var.ec2_ami_id intentionally when you want to roll to a newer image.
  ami                    = var.ec2_ami_id
  instance_type          = var.ec2_instance_type
  iam_instance_profile   = aws_iam_instance_profile.ec2_instance.name
  key_name               = aws_key_pair.portfolio.key_name
  subnet_id              = tolist(data.aws_subnets.default.ids)[0]
  vpc_security_group_ids = [aws_security_group.portfolio.id]

  # Ensure Django has enough disk space for media / SQLite
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    delete_on_termination = true
    encrypted             = true
  }

  # Enforce IMDSv2 — prevents SSRF-based metadata credential theft.
  # hop_limit=1 blocks requests from containers/nested VMs on the same host.
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  user_data = base64encode(templatefile("${path.module}/templates/user_data.sh.tpl", {
    github_repo_url      = var.github_repo_url
    django_secret_key    = var.django_secret_key
    django_allowed_hosts = var.django_allowed_hosts
    s3_bucket_media      = aws_s3_bucket.media.bucket
    aws_region           = var.aws_region
    db_name              = aws_db_instance.portfolio.db_name
    db_user              = aws_db_instance.portfolio.username
    db_password          = var.db_password
    db_host              = aws_db_instance.portfolio.address
    db_port              = aws_db_instance.portfolio.port
    # AWS credentials are supplied automatically via the EC2 instance profile —
    # no long-lived keys needed here.
  }))

  # Replace instance when user_data changes (new bootstrap)
  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project}-server"
  }
}

# ── Elastic IP — stable address that survives stop/start ─────────────────────
resource "aws_eip" "portfolio" {
  instance = aws_instance.portfolio.id
  domain   = "vpc"

  tags = {
    Name = "${var.project}-eip"
  }

  depends_on = [aws_instance.portfolio]
}
