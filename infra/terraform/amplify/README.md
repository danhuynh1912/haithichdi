# Terraform Phase 1: AWS Amplify For Frontend

This stack is the first Infrastructure as Code step for the `frontend/` repository.

It manages:

- one `aws_amplify_app`
- one `aws_amplify_branch`
- the branch environment variables required by this Next.js app

It does **not** manage yet:

- custom domain association
- Route 53 records
- ACM certificates outside Amplify-managed flow
- remote Terraform state backend

That split is intentional. For practice, start with the smallest useful slice first, then add DNS and state management in the next round.

## 1. What this stack assumes

- The Git repository for the frontend is `https://github.com/danhuynh1912/haithichdi-nextjs.git`
- The frontend root already contains `amplify.yml`
- The app is a Next.js SSR-capable app, so Amplify uses `platform = "WEB_COMPUTE"`
- The backend API is reachable from the public internet

## 2. Files in this folder

- `versions.tf`: Terraform and provider versions
- `provider.tf`: AWS provider configuration
- `variables.tf`: all input variables
- `locals.tf`: merges required and optional env vars for the branch
- `main.tf`: creates the Amplify app and branch
- `outputs.tf`: useful IDs and console links after apply
- `terraform.tfvars.example`: copy this to `terraform.tfvars` and fill real values

## 3. Prerequisites

1. Install Terraform locally.
2. Configure AWS credentials with either:
   - `aws configure`
   - or `AWS_PROFILE=...`
   - or standard `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
3. Create a GitHub Personal Access Token that Amplify can use to connect the repo.
   The Terraform provider documents that `access_token` must have write access to create a webhook and deploy key.
4. Make sure your backend URLs are final enough for the first deployment:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `SERVER_API_BASE_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - optionally `NEXT_PUBLIC_MEDIA_BASE_URL`

## 4. Step-by-step

### Step 1: move into the Terraform folder

```bash
cd frontend/infra/terraform/amplify
```

### Step 2: create your variable file

```bash
cp terraform.tfvars.example terraform.tfvars
```

Then edit `terraform.tfvars` with the real values for:

- AWS region
- frontend repository URL
- branch name
- production or staging API URLs
- production site URL
- optional media URL

### Step 3: provide the GitHub token safely

Do not hardcode the token in `terraform.tfvars`.

Use an environment variable instead:

```bash
export TF_VAR_repository_access_token="ghp_xxx"
```

Why:

- the token is sensitive
- the Terraform AWS provider documents that Amplify does not store the token after setup
- you usually only need it during creation or when reconnecting the repository

### Step 4: initialize Terraform

```bash
terraform init
```

This downloads the AWS provider declared in `versions.tf`.

### Step 5: review the execution plan

```bash
terraform plan
```

You should see Terraform preparing:

- one Amplify app
- one Amplify branch

At this point, verify especially:

- `platform = "WEB_COMPUTE"`
- the branch environment variables
- the repository URL
- the branch name

### Step 6: apply

```bash
terraform apply
```

Approve the plan when it looks correct.

### Step 7: inspect the outputs

After `apply`, note:

- `amplify_app_id`
- `amplify_default_domain`
- `amplify_console_url`

Open the Amplify console and confirm:

- the app was created
- the configured branch is connected
- the first build starts
- Amplify uses the `amplify.yml` file from the repo

### Step 8: trigger a content change deployment

Push a small change to the configured Git branch.

This verifies that:

- Amplify webhook integration works
- auto build for the branch works
- Terraform-managed infrastructure and Git-based deployment are connected correctly

## 5. Why the configuration is shaped like this

### `platform = "WEB_COMPUTE"`

This is the correct platform type for Next.js SSR-capable deployments on Amplify.

### `build_spec = file("${path.module}/../../../amplify.yml")`

Terraform reads the existing `amplify.yml` in the frontend repository root instead of duplicating build settings inside HCL.

That keeps the responsibilities clean:

- frontend build logic stays next to frontend code
- infrastructure creation stays in Terraform

### Branch environment variables

This app needs branch-level env vars because production and staging often point to different backend URLs.

The required ones are:

- `NEXT_PUBLIC_API_BASE_URL`
- `SERVER_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`

Optional:

- `NEXT_PUBLIC_MEDIA_BASE_URL`

### Optional IAM role inputs

`iam_service_role_arn` and `compute_role_arn` are left as optional inputs.

That keeps phase 1 simpler:

- if your Amplify setup works without custom roles, leave them empty
- if your account policy or SSR setup later needs explicit roles, you can add them without redesigning the stack

## 6. Safe learning sequence after this

Once phase 1 works, do the next layers in this order:

1. Add a second branch resource for staging.
2. Add `aws_amplify_domain_association` for the custom domain.
3. Add Route 53 records if your DNS is in AWS.
4. Move Terraform state to S3 + locking mechanism.
5. Split this folder into reusable modules if you later manage multiple apps.

## 7. Common mistakes

- Putting the GitHub token into `terraform.tfvars`
- Reusing localhost URLs in branch env vars
- Forgetting that SSR metadata fetches use `SERVER_API_BASE_URL`
- Forgetting to allow the production media hostname for `next/image`
- Managing too much at once before the first Amplify deploy succeeds

## 8. Useful references

- AWS Amplify Next.js deployment guide:
  `https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html`
- AWS Amplify environment variables:
  `https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html`
- AWS Amplify SSR environment variables:
  `https://docs.aws.amazon.com/amplify/latest/userguide/ssr-environment-variables.html`
- Terraform AWS provider `aws_amplify_app`:
  `https://raw.githubusercontent.com/hashicorp/terraform-provider-aws/main/website/docs/r/amplify_app.html.markdown`
- Terraform AWS provider `aws_amplify_branch`:
  `https://raw.githubusercontent.com/hashicorp/terraform-provider-aws/main/website/docs/r/amplify_branch.html.markdown`
