export const dynamic = "force-dynamic";

export default function PanduanPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panduan SSO</h1>
        <p className="mt-1 text-sm text-gray-500">
          Panduan lengkap penggunaan sistem Single Sign-On Universitas Gajayana Malang
        </p>
      </div>

      {/* Table of Contents */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Daftar Isi</h2>
        <nav className="space-y-1">
          <a href="#konsep" className="block rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">1. Apa itu SSO?</a>
          <a href="#alur" className="block rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">2. Alur Login SSO</a>
          <a href="#panduan-user" className="block rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">3. Panduan untuk Pengguna</a>
          <a href="#panduan-admin" className="block rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">4. Panduan untuk Admin</a>
          <a href="#tambah-app" className="block rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">5. Menambahkan Aplikasi Baru</a>
          <a href="#akun-demo" className="block rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">6. Akun Demo</a>
          <a href="#troubleshoot" className="block rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">7. Troubleshooting</a>
        </nav>
      </div>

      {/* Section 1: Apa itu SSO */}
      <section id="konsep" className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">1. Apa itu SSO?</h2>
        <div className="prose prose-sm max-w-none text-gray-600">
          <p>
            <strong>Single Sign-On (SSO)</strong> adalah sistem autentikasi terpusat yang memungkinkan pengguna
            untuk <strong>login sekali</strong> dan langsung bisa mengakses <strong>semua aplikasi internal</strong> Universitas Gajayana Malang
            tanpa perlu login ulang di setiap aplikasi.
          </p>
          <div className="mt-4 rounded-lg bg-blue-50 p-4 border border-blue-100">
            <p className="font-medium text-blue-800">Aplikasi yang terhubung saat ini:</p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li><strong>Persuratan</strong> — Sistem penomoran dan arsip surat (<code>surat.unigamalang.ac.id</code>)</li>
              <li><strong>Inventarisir</strong> — Sistem inventaris barang (<code>inventaris.unigamalang.ac.id</code>)</li>
            </ul>
          </div>
          <p className="mt-4">
            Dengan SSO, admin cukup mengelola <strong>1 akun per pengguna</strong> di SSO Gateway ini,
            dan pengguna tersebut bisa login ke semua aplikasi yang terdaftar.
          </p>
        </div>
      </section>

      {/* Section 2: Alur Login */}
      <section id="alur" className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">2. Alur Login SSO</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">1</div>
            <div>
              <p className="font-medium text-gray-900">User membuka aplikasi (misal Persuratan)</p>
              <p className="text-sm text-gray-500">User belum login, muncul halaman login dengan tombol &quot;Masuk dengan UNIGA SSO&quot;</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">2</div>
            <div>
              <p className="font-medium text-gray-900">Klik tombol SSO</p>
              <p className="text-sm text-gray-500">User diarahkan ke halaman login SSO Gateway ini</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">3</div>
            <div>
              <p className="font-medium text-gray-900">Login dengan email @unigamalang.ac.id</p>
              <p className="text-sm text-gray-500">Masukkan email dan kata sandi yang terdaftar di SSO</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">4</div>
            <div>
              <p className="font-medium text-gray-900">Redirect otomatis ke aplikasi</p>
              <p className="text-sm text-gray-500">Setelah login berhasil, user langsung masuk ke aplikasi tujuan</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">5</div>
            <div>
              <p className="font-medium text-gray-900">Buka aplikasi lain = otomatis login!</p>
              <p className="text-sm text-gray-500">Karena sesi SSO masih aktif (7 hari), user tidak perlu login lagi di aplikasi lainnya</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Panduan User */}
      <section id="panduan-user" className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">3. Panduan untuk Pengguna</h2>
        <div className="prose prose-sm max-w-none text-gray-600">
          <h3 className="text-base font-semibold text-gray-800">Login Pertama Kali</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Buka salah satu aplikasi (misal <code>surat.unigamalang.ac.id</code>)</li>
            <li>Klik tombol <strong>&quot;Masuk dengan UNIGA SSO&quot;</strong></li>
            <li>Masukkan email institusi dan kata sandi yang diberikan admin</li>
            <li>Setelah berhasil, Anda langsung masuk ke aplikasi</li>
          </ol>

          <h3 className="mt-6 text-base font-semibold text-gray-800">Akses Aplikasi Lain</h3>
          <p>
            Setelah login di satu aplikasi, buka aplikasi lain (misal <code>inventaris.unigamalang.ac.id</code>)
            dan klik &quot;Masuk dengan UNIGA SSO&quot; — Anda akan <strong>langsung masuk tanpa perlu ketik password lagi</strong>.
          </p>

          <h3 className="mt-6 text-base font-semibold text-gray-800">Durasi Sesi</h3>
          <p>
            Sesi SSO berlaku selama <strong>7 hari</strong>. Setelah 7 hari, Anda perlu login ulang.
          </p>
        </div>
      </section>

      {/* Section 4: Panduan Admin */}
      <section id="panduan-admin" className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">4. Panduan untuk Admin</h2>
        <div className="prose prose-sm max-w-none text-gray-600">
          <h3 className="text-base font-semibold text-gray-800">Menambah Pengguna Baru</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Login ke SSO Dashboard (<code>unigamalang-sso.vercel.app</code>)</li>
            <li>Klik menu <strong>&quot;Pengguna&quot;</strong> di sidebar</li>
            <li>Isi form: Nama, Email (@unigamalang.ac.id), dan Kata Sandi</li>
            <li>Klik <strong>&quot;Tambah Pengguna&quot;</strong></li>
            <li>Informasikan email dan kata sandi ke pengguna baru</li>
          </ol>

          <h3 className="mt-6 text-base font-semibold text-gray-800">Melihat Daftar Pengguna</h3>
          <p>
            Di menu <strong>Pengguna</strong>, Anda bisa melihat semua pengguna yang terdaftar beserta:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nama dan email</li>
            <li>Role per aplikasi (misal: SUPER_ADMIN di Persuratan, Admin di Inventarisir)</li>
            <li>Status aktif/nonaktif</li>
            <li>Tanggal pendaftaran</li>
          </ul>

          <h3 className="mt-6 text-base font-semibold text-gray-800">Monitoring</h3>
          <p>
            Di halaman <strong>Dashboard</strong>, Anda bisa melihat statistik:
            total pengguna aktif, jumlah aplikasi terdaftar, dan jumlah sesi aktif.
          </p>
        </div>
      </section>

      {/* Section 5: Tambah App */}
      <section id="tambah-app" className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">5. Menambahkan Aplikasi Baru ke SSO</h2>
        <div className="prose prose-sm max-w-none text-gray-600">
          <p>
            Untuk menambahkan aplikasi baru ke jaringan SSO, ada 2 langkah:
          </p>

          <h3 className="text-base font-semibold text-gray-800">Langkah 1: Daftarkan di SSO Dashboard</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Buka menu <strong>&quot;Aplikasi&quot;</strong></li>
            <li>Isi form Daftarkan Aplikasi Baru:
              <ul className="list-disc pl-5 mt-1">
                <li><strong>Client ID</strong> — identifier unik, misal <code>e-learning</code></li>
                <li><strong>Nama Aplikasi</strong> — nama tampilan, misal <code>UNIGA E-Learning</code></li>
                <li><strong>Redirect URI</strong> — URL callback, misal <code>https://elearning.unigamalang.ac.id/auth/callback</code></li>
              </ul>
            </li>
            <li>Klik <strong>&quot;Daftarkan Aplikasi&quot;</strong></li>
            <li><strong>Simpan Client Secret yang muncul!</strong> Secret hanya ditampilkan sekali</li>
          </ol>

          <h3 className="mt-6 text-base font-semibold text-gray-800">Langkah 2: Konfigurasi di Aplikasi</h3>
          <p>
            Set environment variables berikut di aplikasi baru:
          </p>
          <div className="rounded-lg bg-gray-800 p-4 text-sm font-mono text-green-400 overflow-x-auto">
            <p>SSO_BASE_URL=https://unigamalang-sso.vercel.app</p>
            <p>SSO_CLIENT_ID=e-learning</p>
            <p>SSO_CLIENT_SECRET=&lt;secret dari step 1&gt;</p>
            <p>SSO_REDIRECT_URI=https://elearning.unigamalang.ac.id/auth/callback</p>
          </div>
          <p className="mt-4">
            Lalu tambahkan route <code>/auth/callback</code> di aplikasi untuk menerima kode otorisasi dari SSO.
            Contoh implementasi tersedia di repo Persuratan dan Inventarisir.
          </p>
        </div>
      </section>

      {/* Section 6: Akun Demo */}
      <section id="akun-demo" className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">6. Akun Demo</h2>
        <p className="mb-4 text-sm text-gray-500">
          Akun-akun berikut sudah tersedia untuk testing:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Password</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-900">admin@unigamalang.ac.id</td>
                <td className="px-4 py-3 font-mono text-gray-900">admin123</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">SUPER_ADMIN</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-900">hr@unigamalang.ac.id</td>
                <td className="px-4 py-3 font-mono text-gray-900">hr12345</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">ADMIN_UNIT</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-900">rektor@unigamalang.ac.id</td>
                <td className="px-4 py-3 font-mono text-gray-900">rektor123</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">ADMIN_UNIT</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-900">dewi.anggraeni@unigamalang.ac.id</td>
                <td className="px-4 py-3 font-mono text-gray-900">pegawai123</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">USER</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 7: Troubleshooting */}
      <section id="troubleshoot" className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">7. Troubleshooting</h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-medium text-yellow-800">Tombol &quot;Masuk dengan UNIGA SSO&quot; tidak muncul</p>
            <p className="mt-1 text-sm text-yellow-700">
              Pastikan environment variable <code className="rounded bg-yellow-100 px-1">SSO_BASE_URL</code> sudah diset di Vercel project aplikasi tersebut.
              Untuk Inventarisir, pastikan juga <code className="rounded bg-yellow-100 px-1">NEXT_PUBLIC_SSO_LOGIN_URL</code> sudah diset.
            </p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-medium text-yellow-800">Error &quot;Invalid client_id&quot; saat login SSO</p>
            <p className="mt-1 text-sm text-yellow-700">
              Pastikan <code className="rounded bg-yellow-100 px-1">SSO_CLIENT_ID</code> di aplikasi sesuai dengan Client ID yang terdaftar di menu Aplikasi SSO.
            </p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-medium text-yellow-800">Error &quot;Invalid redirect_uri&quot;</p>
            <p className="mt-1 text-sm text-yellow-700">
              Pastikan <code className="rounded bg-yellow-100 px-1">SSO_REDIRECT_URI</code> di aplikasi <strong>sama persis</strong> dengan Redirect URI yang terdaftar di SSO. Perhatikan https vs http dan trailing slash.
            </p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-medium text-yellow-800">Login berhasil tapi tidak redirect ke aplikasi</p>
            <p className="mt-1 text-sm text-yellow-700">
              Cek apakah route <code className="rounded bg-yellow-100 px-1">/auth/callback</code> sudah ada di aplikasi dan dapat menerima parameter <code className="rounded bg-yellow-100 px-1">code</code>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
