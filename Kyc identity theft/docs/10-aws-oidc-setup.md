# One-time AWS setup for the GitHub Actions build

Run these once, from any machine with the AWS CLI configured (no Docker needed).
Region is `us-east-1`; repo is `mehta-sahil/Argonauts`.

## 1. Create the ECR repository

```bash
aws ecr create-repository \
  --repository-name kyc-backend \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true
```

## 2. Register GitHub as an OIDC identity provider

Only needed once per AWS account. If it already exists this errors harmlessly.

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

## 3. Create the role GitHub will assume

The trust policy is scoped to this repository, so no other repo can assume it.

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

cat > trust.json <<JSON
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:mehta-sahil/Argonauts:*"
      }
    }
  }]
}
JSON

aws iam create-role \
  --role-name github-actions-kyc-ecr \
  --assume-role-policy-document file://trust.json

aws iam attach-role-policy \
  --role-name github-actions-kyc-ecr \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

echo "arn:aws:iam::${ACCOUNT_ID}:role/github-actions-kyc-ecr"
```

## 4. Add the role ARN to GitHub

Repo → Settings → Secrets and variables → Actions → New repository secret:

- Name: `AWS_ROLE_ARN`
- Value: the ARN printed by the last command

## 5. Run it

Actions → "KYC backend image" → Run workflow. It also runs automatically on
pushes to `main` that touch the backend, models or Dockerfile.

## Notes

- `AmazonEC2ContainerRegistryPowerUser` is broader than strictly needed. For a
  tighter policy, scope `ecr:*` actions to the `kyc-backend` repository ARN.
- The workflow needs no long-lived credentials. Nothing to rotate, nothing to leak.
