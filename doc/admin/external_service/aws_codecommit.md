# AWS CodeCommit

Site admins can sync Git repositories hosted on [AWS CodeCommit](https://aws.amazon.com/codecommit/) with Sourcegraph so that users can search and navigate the repositories.

To set this up, add AWS CodeCommit as an external service to Sourcegraph:

1. Go to **User menu > Site admin**.
1. Open the **External services** page.
1. Press **+ Add external service**.
1. Enter a **Display name** (using "AWS CodeCommit" is OK if you only have one AWS CodeCommit connection).
1. In the **Kind** menu, select **AWS CodeCommit**.
1. Configure the connection to AWS CodeCommit in the JSON editor. Use Cmd/Ctrl+Space for completion, and [see configuration documentation below](aws_codecommit.md#configuration).
1. Press **Add external service**.

## AWS CodeCommit Git credentials

Since version **3.4** of Sourcegraph, the AWS CodeCommit service **requires** [Git credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_ssh-keys.html#git-credentials-code-commit) in order to clone repositories via HTTPS. Git credentials consist of a username and a password that you can create in AWS IAM. 

For detailed instructions on how to create the credentials in IAM, see: [Setup for HTTPS Users Using Git Credentials](https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-gc.html)

## Configuration

AWS CodeCommit external service connections support the following configuration options, which are specified in the JSON editor in the site admin external services area.

<div markdown-func=jsonschemadoc jsonschemadoc:path="admin/external_service/aws_codecommit.schema.json">[View page on docs.sourcegraph.com](https://docs.sourcegraph.com/admin/external_service/aws_codecommit) to see rendered content.</div>
