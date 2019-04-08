## AWS SAR ECS / EKS 

This is a Vue.JS serverless app starter kit that help you launch your next Serverless project. It is integrated with many AWS Services such as : DynamoDB / Cognito / GraphQL / S3. 

This app contains multiple AWS resources, including Cognito and enforcing MFA.

## Installation Instructions

For a step-by-step walkthrough of using this app with AWS CodePipeline, see [this tutorial](https://docs.aws.amazon.com/codepipeline/latest/userguide/tutorials-serverlessrepo-auto-publish.html).

1 - Find the application

  # For ACenterA Prod Core you need to acknowledge it will create IAM Roles or Resource policies.
  [Serverless Repositoryp]https://console.aws.amazon.com/serverlessrepo/home?region=us-east-1#/available-applications

  [Serverless Create App]https://console.aws.amazon.com/lambda/home?region=us-east-1#/create/app?applicationId=arn:aws:serverlessrepo:us-east-1:356769441913:applications/acentera-prod-core

  ![01 - Serverless App Core](https://github.com/ACenterA/acentera-aws-core/raw/master/docs/images/01_ACENTERA_CORE_PROD.png)

2 - Add a valid phone number (required for MFA) including area code

  ![02 - Serverless App Install](https://github.com/ACenterA/acentera-aws-core/raw/master/docs/images/02_ACENTERA_CORE_DEPLOY.png)

3 - Find Values in the Stack Output

  Find the AWS Account Id (AccountIdD)

  Find the CloudFront URL (WebsiteUrl)

  Navigate to the CloudFront URL you will be asking to proceed with the initialization

4 - App Initialization

  Enter the AccountId to confirm ownership.

  ![04 - Serverless App Configuration](https://github.com/ACenterA/acentera-aws-core/raw/master/docs/images/04_ACENTERA_BOOTSTRAP.png)

5 - App Admin Account and Secrets

  Accept the licence and term of services, and follow the instructions to create a temporary password.

  ![05 - Serverless App Configuration](https://github.com/ACenterA/acentera-aws-core/raw/master/docs/images/05_ACENTERA_BOOTSTRAP_CONFIRM.png)

6 - App Admin Account and login.

  Enter the temporary password, you will need to sign-in using MFA.

  ![07 - Serverless App Admin account](https://github.com/ACenterA/acentera-aws-core/raw/master/docs/images/07_ACENTERA_LOGIN.png)
 
  Use your phone to register an MFA Device using Google Authenticator

  ![11 - Serverless App MFA Software](https://github.com/ACenterA/acentera-aws-core/raw/master/docs/images/11_ACENTERA_REGISTER_RSOFTWARETOKEN.png)

7 - You should be successfully logged in to the application
  ![13 - Serverless App Success Login](https://github.com/ACenterA/acentera-aws-core/raw/master/docs/images/13_ACENTERA_LOGGED_IN.png)


Contact support, and ask for a premium access to allow embedding this app into a SAM template using [nested apps](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessapplication).

## App Outputs

1. `AccountId` - Your aws Account Id.
1. `WebsiteUrl` - Your aws cloudfront https entrypoint.

## License Summary

This code is made available under the Apache license. See the LICENSE file.
