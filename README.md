# CloudVoxel
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/9876/badge)](https://www.bestpractices.dev/projects/9876)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FOpenVoxelStudios%2FCloudVoxel.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2FOpenVoxelStudios%2FCloudVoxel?ref=badge_shield&issueType=license)

**A powerful, local-first solution for large file sharing**

![CloudVoxel Interface](/.github/assets/mainpage.png)

## What is CloudVoxel?

CloudVoxel is a robust file-sharing platform that puts you in control:

- 📤 **Unlimited Uploads**: No arbitrary file size restrictions
- 🔗 **File Sharing**: Share files with others, even if they are not logged in
- 🔒 **Access Control**: User whitelisting by their email address
- 💡 **Open Source**: Community-driven development and transparency

## Preview

<video src="https://github.com/user-attachments/assets/9d8434b2-12da-4586-b928-f75caedaded3" alt="Login Providers"></video>

<video src="https://github.com/user-attachments/assets/96a27c3f-b76e-4604-aaff-1c6fd81076d3" alt="Use Folders"></video>

<video src="https://github.com/user-attachments/assets/132b2e5b-fd70-4104-8756-6e094cd85895" alt="Rename and Move"></video>

<video src="https://github.com/user-attachments/assets/90ebe6a5-94a9-4caf-a035-690aee5da667" alt="Share Files"></video>

## Installation

First, clone the repository and prepare the configuration files:
```bash
git clone https://github.com/OpenVoxelStudios/CloudVoxel/
cd CloudVoxel
cp .env.example .env.production
cp config.example.ts config.ts
```

Then install the dependencies with `bun install`, `npm install` or any other node package manager.

Now, there are 3 config files, so go ahead and edit them!
```yaml
- clientconfig.ts: All the configuration that will be used client side
- config.ts: The server side configuration
- .env.production: All the credentials and keys
```

Now that you have your config, you can init the database with one of these commands:
```bash
npx drizzle-kit generate && npx drizzle-kit migrate
# or
bunx drizzle-kit generate && bunx drizzle-kit migrate
```

**You are now ready to run CloudVoxel!**

In dev mode:
```bash
npx next dev
```

Or in production mode:
```bash
# only run build once after each edit
npx next build
npx next start
```

NOTE: NextJS does not use https. If you want to open it to the internet in https (highly recommended), you can use software like NGINX to serve as a "proxy".

## Contributing

If you wish to contribute to CloudVoxel you can freely do so!

Please read the [CONTRIBUTING.md](/CONTRIBUTING.md) guide before doing so.

### Bug reports / Vulnerability reports

If you find bugs, please let us know! You can create a bug report in the [issues tab](https://github.com/OpenVoxelStudios/CloudVoxel/issues) of the repository.

If you find a vulnerability, we encourage you to privately submit it in the [security tab](https://github.com/OpenVoxelStudios/CloudVoxel/security) of the repository. Thank you for keeping CloudVoxel safe!

---

### Thank you for having interest into CloudVoxel!
MIT LICENSED - Copyright (c) 2025 OpenVoxel Studios