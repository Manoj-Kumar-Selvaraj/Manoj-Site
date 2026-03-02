# Deployment Guide

## Architecture

```
GitHub (push to main)
    │
    ├─ GitHub Actions ──OIDC──► AWS IAM Role (no stored keys)
    │       │
    │       ├── Frontend job ──► S3 bucket ──► CloudFront CDN ──► Users
    │       │
    │       └── Backend job ──SSH──► EC2 (Nginx + Gunicorn + Django)
    │
    └─ Terraform Apply job ──► Terraform Cloud ──► AWS infrastructure
```

| Component | Technology |
|-----------|-----------|
| Frontend | React / Vite → S3 + CloudFront |
| Backend API | Django + Gunicorn → EC2 (t3.micro) |
| Web server | Nginx (reverse proxy + static files) |
| Backend process | systemd service (`portfolio-gunicorn`) |
| Media storage | S3 bucket (via `django-storages`) |
| Infrastructure | Terraform (Terraform Cloud remote backend) |
| CI/CD | GitHub Actions with OIDC (no long-lived AWS keys) |

---

## Prerequisites

- **AWS account** with programmatic access (for Terraform bootstrap only)
- **Terraform Cloud** account — [app.terraform.io](https://app.terraform.io) (free tier)
- **GitHub** repository with Actions enabled
- **Node.js 20+** and **Python 3.11+** locally (for local testing)
- `aws` CLI installed locally (`brew install awscli` / `winget install Amazon.AWSCLI`)
- `terraform` CLI installed locally (`brew install terraform` / use `tfenv`)

---

## Step 1 — Generate an SSH key pair for EC2

```bash
# Generate a dedicated key (do NOT reuse your personal key)
ssh-keygen -t ed25519 -C "portfolio-deploy" -f ~/.ssh/portfolio_deploy

# Output: two files
#   ~/.ssh/portfolio_deploy      ← private key  (add to GitHub Secrets as EC2_SSH_KEY)
#   ~/.ssh/portfolio_deploy.pub  ← public key   (paste into terraform.tfvars as ec2_public_key)

# Print the public key to copy
cat ~/.ssh/portfolio_deploy.pub

# Print the private key to copy
cat ~/.ssh/portfolio_deploy
```

---

## Step 2 — Configure Terraform variables

Copy the example vars file and fill in every value:

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
# AWS
aws_region   = "us-east-1"       # or your preferred region
project      = "portfolio"

# EC2
ec2_instance_type = "t3.micro"
ec2_public_key    = "ssh-ed25519 AAAA... portfolio-deploy"  # paste .pub contents
allowed_ssh_cidrs = ["YOUR.IP.HERE/32"]    # restrict to your IP only

# Django
django_secret_key    = "generate-a-50-char-random-string"
django_allowed_hosts = "localhost,127.0.0.1"  # updated after EC2 IP is known

# S3 — globally unique names
frontend_bucket_name = "portfolio-frontend-yourname"
media_bucket_name    = "portfolio-media-yourname"

# GitHub
github_repo_url  = "https://github.com/YOUR_USERNAME/portfolio.git"
github_owner     = "YOUR_USERNAME"
github_repo_name = "portfolio"
github_token     = "ghp_..."       # PAT with repo + admin:repo_hook scopes
```

> **Tip — generate a Django secret key:**
> ```bash
> python3 -c "import secrets; print(secrets.token_urlsafe(50))"
> ```

---

## Step 3 — Set up Terraform Cloud

1. Create a **workspace** in Terraform Cloud (choose "CLI-driven" workflow)
2. Set workspace **Execution Mode → Remote**
3. In the workspace **Variables** tab, add these as **sensitive Environment Variables**:
   - `AWS_ACCESS_KEY_ID` — your bootstrap IAM user key (used only by Terraform, not GitHub Actions)
   - `AWS_SECRET_ACCESS_KEY` — matching secret
4. Get your **TFC Team Token**: TFC → User Settings → Tokens → Create API Token
5. Set the backend in `infra/terraform/versions.tf` (already configured) — replace `ORGANIZATION` and `WORKSPACE_NAME` if needed

---

## Step 4 — Provision Infrastructure

```bash
cd infra/terraform

# Authenticate Terraform CLI with TFC
export TFC_TOKEN="your-terraform-cloud-token"
terraform login   # or: echo $TFC_TOKEN | terraform login

terraform init
terraform validate
terraform plan    # review — should create ~20 resources

terraform apply   # type "yes" to confirm
```

> **First apply creates:**
> - EC2 instance (t3.micro) + Elastic IP
> - S3 bucket for frontend
> - S3 bucket for media uploads
> - CloudFront distribution
> - **OIDC provider** + IAM role for GitHub Actions (no long-lived keys)
> - Nginx/Gunicorn systemd service files on EC2 (via `user_data`)
> - GitHub branch protection rules

After apply, collect the outputs:

```bash
terraform output
# or get a specific value:
terraform output ec2_public_ip
terraform output github_actions_role_arn
terraform output github_secrets_summary   # prints all secrets needed
```

---

## Step 5 — Configure GitHub Secrets

Go to: **GitHub repo → Settings → Secrets and Variables → Actions → New repository secret**

| Secret Name | Where to get the value |
|-------------|----------------------|
| `AWS_ROLE_ARN` | `terraform output github_actions_role_arn` |
| `AWS_REGION` | the region you used (e.g. `us-east-1`) |
| `S3_BUCKET_FRONTEND` | `terraform output frontend_bucket_name` |
| `S3_BUCKET_MEDIA` | `terraform output media_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `terraform output cloudfront_distribution_id` |
| `CLOUDFRONT_DOMAIN` | `terraform output cloudfront_domain` (without `https://`) |
| `EC2_HOST` | `terraform output ec2_public_ip` |
| `API_BASE_URL` | `http://<EC2_HOST>/api` |
| `EC2_SSH_KEY` | contents of `~/.ssh/portfolio_deploy` (the **private** key) |
| `DJANGO_SECRET_KEY` | same value as in your `terraform.tfvars` |
| `TF_API_TOKEN` | your Terraform Cloud API token |

> ℹ️ `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are **no longer needed** in GitHub Secrets.  
> GitHub Actions now authenticates via OIDC → IAM role (zero stored credentials).

---

## Step 6 — First-time EC2 server setup

The Terraform `user_data` script installs most dependencies automatically. Once the EC2 is up, do the one-time Django setup:

```bash
# SSH in using your deploy key
ssh -i ~/.ssh/portfolio_deploy ubuntu@$(terraform output -raw ec2_public_ip)

# On the server:
cd /home/ubuntu/portfolio

# Clone the repo (first time only)
git clone https://github.com/YOUR_USERNAME/portfolio.git .

# Create the backend virtualenv
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create the production .env file
cat > .env << 'EOF'
DJANGO_ENV=production
SECRET_KEY=your-django-secret-key
ALLOWED_HOSTS=YOUR_EC2_IP,localhost
CORS_ALLOWED_ORIGINS=https://YOUR_CLOUDFRONT_DOMAIN
AWS_STORAGE_BUCKET_NAME=your-media-bucket-name
AWS_S3_REGION_NAME=us-east-1
USE_S3=true
EOF

# Run migrations and collect static files
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Create the admin superuser
python manage.py createsuperuser

# Install and enable the Gunicorn systemd service
sudo cp /home/ubuntu/portfolio/infra/portfolio-gunicorn.service \
        /etc/systemd/system/portfolio-gunicorn.service
sudo systemctl daemon-reload
sudo systemctl enable portfolio-gunicorn
sudo systemctl start portfolio-gunicorn
sudo systemctl status portfolio-gunicorn

# Install and enable Nginx
sudo cp /home/ubuntu/portfolio/infra/nginx.conf \
        /etc/nginx/sites-available/portfolio
sudo ln -sf /etc/nginx/sites-available/portfolio \
            /etc/nginx/sites-enabled/portfolio
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Verify:
```bash
curl http://localhost/api/
# → should return {"detail": "Not found."} or similar JSON (not HTML)
```

---

## Step 7 — Deploy via GitHub Actions

Every push to `main` automatically triggers deployment. For a manual deploy:

1. GitHub → **Actions** tab
2. Select **"Deploy Application"** workflow
3. Click **"Run workflow"** → **Run workflow**

The workflow runs three jobs in order:
1. `deploy-frontend` — builds React, syncs to S3, invalidates CloudFront
2. `deploy-backend` — SSHes to EC2, pulls code, runs migrations, restarts Gunicorn
3. `health-check` — verifies API + CloudFront return 2xx

---

## Step 8 — Optional: Custom domain + HTTPS

Once your domain's DNS points to the EC2 IP and CloudFront:

```bash
# On the EC2 server — install Certbot and get an SSL certificate
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com

# Certbot automatically adds the HTTPS block to nginx.conf and sets up auto-renewal
sudo systemctl reload nginx
```

Update Django `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` in `/home/ubuntu/portfolio/backend/.env`:
```
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

Then restart Gunicorn:
```bash
sudo systemctl restart portfolio-gunicorn
```

---

## Step 9 — Update `ALLOWED_HOSTS` after IP is known

Edit `terraform.tfvars` and re-apply to update the EC2 userdata tag (or update the `.env` directly on the server):

```
django_allowed_hosts = "YOUR_EC2_IP,yourdomain.com"
```

---

## Day-to-day workflow

```
git add .
git commit -m "feat: add new section"
git push origin main          # ← triggers deploy automatically
```

Watch progress: GitHub → Actions → "Deploy Application"

---

## Backup & Snapshot

Take a DB + content snapshot before major changes:

```bash
# On the server
cd /home/ubuntu/portfolio/backend
source venv/bin/activate
python manage.py snapshot_data
# → writes to backend/snapshots/portfolio_YYYYMMDD_HHMMSS.json

# To restore
python manage.py loaddata snapshots/portfolio_snapshot.json
```

---

## Troubleshooting

### Gunicorn won't start
```bash
sudo journalctl -u portfolio-gunicorn -n 50 --no-pager
sudo systemctl status portfolio-gunicorn
```

### Nginx 502 Bad Gateway
```bash
# Check Gunicorn is running and bound to 127.0.0.1:8000
curl http://127.0.0.1:8000/api/
sudo ss -tlnp | grep 8000
```

### GitHub Actions OIDC error: "Not authorized to perform sts:AssumeRoleWithWebIdentity"
- Confirm the workflow job has `environment: production`
- Confirm `AWS_ROLE_ARN` secret matches `terraform output github_actions_role_arn`
- The IAM role trust policy restricts to `environment:production` in the OIDC subject

### GitHub Actions OIDC error: "Credentials could not be loaded"
- Confirm the workflow has `permissions: id-token: write` (already set at workflow level in `deploy-app.yml`)

### CloudFront still serving old files
```bash
# Manual invalidation
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### View Django logs on EC2
```bash
sudo tail -f /var/log/gunicorn-access.log
sudo tail -f /var/log/gunicorn-error.log
sudo journalctl -fu portfolio-gunicorn
```
