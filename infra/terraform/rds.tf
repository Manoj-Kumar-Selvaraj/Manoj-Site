resource "aws_security_group" "rds" {
  name        = "${var.project}-rds-sg"
  description = "PostgreSQL access from portfolio EC2"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "PostgreSQL from portfolio EC2"
    from_port       = var.db_port
    to_port         = var.db_port
    protocol        = "tcp"
    security_groups = [aws_security_group.portfolio.id]
  }

  egress {
    description      = "All outbound"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "${var.project}-rds-sg"
  }
}

resource "aws_db_subnet_group" "portfolio" {
  name       = "${var.project}-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name = "${var.project}-db-subnet-group"
  }
}

resource "aws_db_instance" "portfolio" {
  identifier                 = "${var.project}-postgres"
  engine                     = "postgres"
  instance_class             = var.db_instance_class
  allocated_storage          = var.db_allocated_storage
  max_allocated_storage      = var.db_max_allocated_storage
  storage_type               = "gp3"
  storage_encrypted          = true
  db_name                    = var.db_name
  username                   = var.db_username
  password                   = var.db_password
  port                       = var.db_port
  publicly_accessible        = false
  multi_az                   = false
  auto_minor_version_upgrade = true
  backup_retention_period    = var.db_backup_retention_days
  deletion_protection        = false
  skip_final_snapshot        = var.db_skip_final_snapshot
  apply_immediately          = true
  db_subnet_group_name       = aws_db_subnet_group.portfolio.name
  vpc_security_group_ids     = [aws_security_group.rds.id]

  tags = {
    Name = "${var.project}-postgres"
  }
}