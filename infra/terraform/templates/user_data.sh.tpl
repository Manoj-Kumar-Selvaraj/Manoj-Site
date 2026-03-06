#!/bin/bash
# EC2 User Data — bootstraps Ubuntu 22.04 for the portfolio Django backend
# Rendered by Terraform templatefile() — vars injected at provision time
set -euxo pipefail
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

echo "=== Portfolio EC2 Bootstrap ==="

# ── System updates ────────────────────────────────────────────────────────────
apt-get update -y
apt-get upgrade -y
apt-get install -y python3.11 python3.11-venv python3-pip git nginx certbot python3-certbot-nginx curl unzip

# AWS CLI v2
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/aws /tmp/awscliv2.zip

# ── Clone repo ────────────────────────────────────────────────────────────────
REPO_DIR="/home/ubuntu/portfolio"
if [ ! -d "$REPO_DIR" ]; then
  git clone "${github_repo_url}" "$REPO_DIR"
fi
chown -R ubuntu:ubuntu "$REPO_DIR"

# ── Python virtualenv ─────────────────────────────────────────────────────────
cd "$REPO_DIR/backend"
sudo -u ubuntu python3.11 -m venv venv
sudo -u ubuntu venv/bin/pip install --upgrade pip -q
sudo -u ubuntu venv/bin/pip install -r requirements.txt -q

# ── Environment file ──────────────────────────────────────────────────────────
cat > "$REPO_DIR/backend/.env" <<'ENVEOF'
SECRET_KEY=${django_secret_key}
DEBUG=False
ALLOWED_HOSTS=${django_allowed_hosts}
AWS_STORAGE_BUCKET_NAME=${s3_bucket_media}
AWS_S3_REGION_NAME=${aws_region}
# AWS credentials are provided automatically via the EC2 instance profile.
# boto3 / django-storages will pick them up from the instance metadata service.
ENVEOF
chmod 600 "$REPO_DIR/backend/.env"
chown ubuntu:ubuntu "$REPO_DIR/backend/.env"

# ── Django setup ──────────────────────────────────────────────────────────────
cd "$REPO_DIR/backend"
sudo -u ubuntu venv/bin/python manage.py migrate --noinput
sudo -u ubuntu venv/bin/python manage.py collectstatic --noinput -v 0

# ── Gunicorn systemd service ──────────────────────────────────────────────────
cp "$REPO_DIR/infra/portfolio-gunicorn.service" /etc/systemd/system/portfolio-gunicorn.service
systemctl daemon-reload
systemctl enable portfolio-gunicorn
systemctl start portfolio-gunicorn

# ── Nginx ─────────────────────────────────────────────────────────────────────
cp "$REPO_DIR/infra/nginx.conf" /etc/nginx/sites-available/portfolio
ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
systemctl enable nginx

echo "=== Bootstrap complete ==="
