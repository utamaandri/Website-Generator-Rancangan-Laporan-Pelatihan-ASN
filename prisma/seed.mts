import "dotenv/config"
import { Client } from "pg"
import bcrypt from "bcryptjs"

const client = new Client({ connectionString: process.env.DATABASE_URL! })
await client.connect()

const adminPassword = await bcrypt.hash("admin123", 12)
const pesertaPassword = await bcrypt.hash("peserta123", 12)

await client.query(
  `INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
   VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
   ON CONFLICT (email) DO UPDATE SET password = $4`,
  [crypto.randomUUID(), "Admin", "admin@asn.com", adminPassword, "admin"]
)

await client.query(
  `INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
   VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
   ON CONFLICT (email) DO UPDATE SET password = $4`,
  [crypto.randomUUID(), "Peserta", "peserta@asn.com", pesertaPassword, "peserta"]
)

console.log("Akun dibuat: admin@asn.com / peserta@asn.com")

const latsarId = crypto.randomUUID()
await client.query(
  `INSERT INTO "TrainingType" (id, name, slug, description, "createdAt", "updatedAt")
   VALUES ($1, $2, $3, $4, NOW(), NOW())
   ON CONFLICT (slug) DO NOTHING`,
  [latsarId, "Latsar", "latsar", "Pelatihan Dasar CPNS"]
)

const pkpId = crypto.randomUUID()
await client.query(
  `INSERT INTO "TrainingType" (id, name, slug, description, "createdAt", "updatedAt")
   VALUES ($1, $2, $3, $4, NOW(), NOW())
   ON CONFLICT (slug) DO NOTHING`,
  [pkpId, "PKP", "pkp", "Pelatihan Kepemimpinan Pengawas"]
)

const pkaId = crypto.randomUUID()
await client.query(
  `INSERT INTO "TrainingType" (id, name, slug, description, "createdAt", "updatedAt")
   VALUES ($1, $2, $3, $4, NOW(), NOW())
   ON CONFLICT (slug) DO NOTHING`,
  [pkaId, "PKA", "pka", "Pelatihan Kepemimpinan Administrator"]
)

const sections = [
  { title: "Latar Belakang", order: 0 },
  { title: "Identifikasi Isu", order: 1 },
  { title: "Gagasan Pemecahan Isu", order: 2 },
  { title: "Rencana Kegiatan", order: 3 },
  { title: "Output & Outcome", order: 4 },
  { title: "Indikator Keberhasilan", order: 5 },
]

const types = await client.query('SELECT id, name FROM "TrainingType"')

for (const tt of types.rows) {
  const existing = await client.query(
    'SELECT id FROM "Template" WHERE name = $1',
    [`Template ${tt.name}`]
  )
  if (existing.rows.length === 0) {
    const templateId = crypto.randomUUID()
    await client.query(
      `INSERT INTO "Template" (id, name, "trainingTypeId", description, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [templateId, `Template ${tt.name}`, tt.id, `Template default untuk ${tt.name}`]
    )
    for (const s of sections) {
      await client.query(
        `INSERT INTO "TemplateSection" (id, "templateId", title, content, "order", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [crypto.randomUUID(), templateId, s.title, `[Konten ${s.title} akan digenerate secara otomatis]`, s.order]
      )
    }
  }
}

console.log("Seed selesai!")
await client.end()
