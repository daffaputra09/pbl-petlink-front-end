## Getting Started on Generating Prompt
1. Buka ChatGPT, input prompt seperti ini:
`
Tolong baca PRD di bawah ini, jika sudah paham, beritahu saya: 
<prd>
{PRD Anda}
</prd>
`   
2. Lalu, berikutnya input prompt seperti ini:
`
Saya mau melakukan prototyping Front End menggunakan Cursor AI, tolong buatin step prompting untuk dieksekusi, mulai dari awal hingga akhir untuk membuat prototyping FE di cursor. Pastikan jangan memberikan prompt per eksekusi yang terlalu banyak agar hasilnya bisa maksimal. Ingat, saya sudah install Next.js App Router dengan TypeScript, TailwindCSS, Shadcn UI, Framer Motion, beserta folder structurnya. 

Berikut ini rules lengkap untuk pembuatan prototype: 
<rules>
{File .cursorrules}
</rules>
`

## Getting Started on Cursor
- Buka project ini di cursor
- Buka terminal di cursor pake shortcut Command+` (aposthrope)
- Jalankan `git checkout -b nama_fitur_atau_app`
- Jalankan `npm install`
- Lalu, jalankan `npm run dev`
- Masukkan PRD anda di .notes/project_overview.md  
- Tekan Command+L, untuk membuka prompting di Cursor
- Add Context, Files & Folders, search .notes/project_overview.md, lalu pilih
- Siap prompting sesuai step eksekusi yang digenerate dari ChatGPT
- Jika pas proses generate ada perintah install sesuatu, langsung click run
- Jika prosesnya prompting udah selesai, silahkan custom prompting jika butuh customize pagenya lebih lanjut sesuai dengan detail kebutuhanmu.
- Jika totally udah selesai, jalankan perintah di terminal `git push origin nama_fitur_atau_app` dan 
