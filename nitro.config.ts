import process from "node:process"
import { join } from "node:path"
import viteNitro from "vite-plugin-with-nitro"
import { RollopGlob } from "./tools/rollup-glob"
import { projectDir } from "./shared/dir"

// Check if MySQL is configured via environment variables
function isMySQLConfigured(): boolean {
  // Check if all required MySQL environment variables are present
  return !!(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD && process.env.MYSQL_DATABASE)
}

// Configure database dynamically based on environment variables
function getDatabaseConfig() {
  if (isMySQLConfigured()) {
    console.log('🔗 Using MySQL connector')
    return {
      default: {
        connector: "mysql2",
        options: {
          host: process.env.MYSQL_HOST,
          port: parseInt(process.env.MYSQL_PORT || "3306"),
          user: process.env.MYSQL_USER,
          password: process.env.MYSQL_PASSWORD,
          database: process.env.MYSQL_DATABASE,
          ssl: process.env.MYSQL_SSL === "true" ? {} : false,
        },
      },
    }
  } else {
    console.log('🗃️ Using SQLite connector')
    return {
      default: {
        connector: "better-sqlite3",
      },
    }
  }
}

const nitroOption: Parameters<typeof viteNitro>[0] = {
  experimental: {
    database: true,
  },
  rollupConfig: {
    plugins: [RollopGlob()],
  },
  sourceMap: false,
  database: getDatabaseConfig(),
  devDatabase: getDatabaseConfig(),
  imports: {
    dirs: ["server/utils", "shared"],
  },
  preset: "node-server",
  alias: {
    "@shared": join(projectDir, "shared"),
    "#": join(projectDir, "server"),
  },
}

if (process.env.VERCEL) {
  nitroOption.preset = "vercel-edge"
  // You can use other online database, do it yourself. For more info: https://db0.unjs.io/connectors
  nitroOption.database = undefined
  // nitroOption.vercel = {
  //   config: {
  //     cache: []
  //   },
  // }
} else if (process.env.CF_PAGES) {
  nitroOption.preset = "cloudflare-pages"
  nitroOption.unenv = {
    alias: {
      "safer-buffer": "node:buffer",
    },
  }
  nitroOption.database = {
    default: {
      connector: "cloudflare-d1",
      options: {
        bindingName: "NEWSNOW_DB",
      },
    },
  }
} else if (process.env.BUN) {
  nitroOption.preset = "bun"
  nitroOption.database = {
    default: {
      connector: "bun-sqlite",
    },
  }
}

export default function () {
  return viteNitro(nitroOption)
}