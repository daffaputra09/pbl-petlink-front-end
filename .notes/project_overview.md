# Product Requirement Document (PRD)  
## Project Title  
**Warehouse Inbound-Outbound Management System**

---

## 1. Purpose  
Membangun sistem flow barang keluar-masuk (inbound-outbound) di warehouse untuk:
- Meningkatkan akurasi stok.
- Mempercepat proses pencatatan.
- Meminimalkan kesalahan manusia (human error).
- Menyediakan laporan real-time tentang status stok.

---

## 2. Scope  
Sistem akan menangani:
- Penerimaan barang dari supplier (Inbound).
- Pengeluaran barang untuk pelanggan atau cabang lain (Outbound).
- Pencatatan stok masuk dan keluar.
- Manajemen mutasi internal antar lokasi warehouse.
- Pelacakan status barang (available, reserved, damaged, etc.).
- Laporan stok harian, mingguan, dan bulanan.

---

## 3. User Persona
| Role | Deskripsi | Akses |
|:---|:---|:---|
| Admin Warehouse | Mengelola semua transaksi keluar-masuk barang | Full Access |
| Staff Warehouse | Input data penerimaan dan pengeluaran barang | Create/Update |
| Manager | Melihat laporan stok, approve transaksi tertentu | Read/Approve Only |
| System Integration | API service untuk integrasi ERP atau eCommerce | API Access Only |

---

## 4. Functional Requirements
### Inbound (Barang Masuk)
- [ ] Membuat form penerimaan barang.
- [ ] Memasukkan detail: Supplier, SKU, jumlah, tanggal terima, kondisi barang.
- [ ] Upload dokumen pendukung (Surat Jalan, Faktur).
- [ ] Sistem akan otomatis update stok.

### Outbound (Barang Keluar)
- [ ] Membuat form pengeluaran barang.
- [ ] Memasukkan detail: Tujuan, SKU, jumlah, tanggal keluar, alasan pengeluaran.
- [ ] Alur approval untuk pengeluaran besar (optional).
- [ ] Update stok secara otomatis setelah barang keluar.

### Stock Management
- [ ] Melihat stok realtime per SKU.
- [ ] Stock opname periodik (rekonsiliasi fisik vs sistem).
- [ ] Notifikasi stok minimum.
- [ ] Kategori status barang (available, reserved, damaged).

### Reporting
- [ ] Laporan stok barang per periode.
- [ ] Riwayat transaksi keluar-masuk per SKU.
- [ ] Export laporan ke Excel/PDF.

### System Integration
- [ ] API endpoint untuk kirim/terima data ke ERP/eCommerce system.
- [ ] Webhook untuk notifikasi perubahan stok.

---

## 5. Non-Functional Requirements
- **Responsiveness**: Bisa diakses via desktop dan tablet.
- **Performance**: Load time maksimal 3 detik.
- **Backup**: Database di-backup otomatis setiap hari.
- **Audit Trail**: Setiap perubahan data dicatat (siapa, apa, kapan).

---

## 6. User Flow Diagram
```
Supplier Delivery --> Penerimaan Barang --> Update Stok

Request Barang Keluar --> Approval Manager (optional) --> Pengeluaran Barang --> Update Stok

Mutasi Barang Internal --> Update Lokasi Stok

Stock Opname --> Koreksi Stok --> Update Sistem

Laporan Stok --> Export
```

---

## 7. Detailed Requirements

| Feature | User Story | Acceptance Criteria |
|:---|:---|:---|
| Penerimaan Barang | Sebagai staff, saya ingin mencatat barang yang diterima, sehingga stok di sistem up-to-date | - Dapat input SKU, supplier, jumlah.<br>- Bisa upload dokumen.<br>- Sistem update stok. |
| Pengeluaran Barang | Sebagai admin, saya ingin mengeluarkan barang ke cabang/pelanggan, sehingga stok terupdate | - Dapat input SKU, jumlah, tujuan.<br>- Dapat optional approval. |
| Stock Monitoring | Sebagai manager, saya ingin melihat status stok agar bisa mengambil keputusan | - Dashboard menampilkan stok.<br>- Ada notifikasi stok rendah. |
| Laporan | Sebagai user, saya ingin mengekspor laporan stok untuk keperluan audit | - Export dalam Excel dan PDF.<br>- Filter berdasarkan tanggal/SKU. |

---