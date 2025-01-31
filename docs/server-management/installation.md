---
icon: download
---

# Installation

CloudVoxel is a flexible software. You can download it on any machine as soon as you can install [Bun](https://bun.sh) (see [Bun Installation](https://bun.sh/docs/installation)). You can start right away by installing bun and running this install script:

```bash
# This will download the code and install all the dependencies for you
curl -fsSL https://raw.githubusercontent.com/OpenVoxelStudios/CloudVoxel/refs/heads/main/install.sh | bash
```

Or you can run the following (it will do the same process):

<pre class="language-bash"><code class="lang-bash">git clone https://github.com/OpenVoxelStudios/CloudVoxel.git
cd CloudVoxel

# Prepare all the config files
cp .env.example .env.production
cp .env.example .env.development
cp clientconfig.example.ts clientconfig.ts
cp config.example.ts config.ts

# This will install dependencies and run post install scripts
bun install
<strong>bun pm trust --all
</strong>
# This will create an empty database ready to use
bun run db.generate
bun run db.migrate
</code></pre>

And there you go! Your instance is (almost) ready!

Visit [configuration.md](configuration.md "mention") for the next steps!
