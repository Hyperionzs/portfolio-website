import 'package:flutter/material.dart';
import '../utils/user_data.dart';

class AppDrawer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            accountName: Text(UserData.username),
            accountEmail: Text('ID: ${UserData.userId}'),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                UserData.username.isNotEmpty ? UserData.username[0].toUpperCase() : 'U',
                style: TextStyle(fontSize: 40.0, color: Colors.blue),
              ),
            ),
            decoration: BoxDecoration(
              color: Colors.blue,
            ),
          ),
          ListTile(
            leading: Icon(Icons.qr_code_scanner),
            title: Text('Scan QR Code'),
            onTap: () {
              Navigator.pop(context);
              // Cek apakah sudah berada di halaman QRScannerPage
              if (ModalRoute.of(context)?.settings.name == '/home') {
                // Jika sudah di halaman QRScannerPage, cukup tutup drawer
                // Navigator sudah dipop di atas
              } else {
                // Jika belum di halaman QRScannerPage, navigasi ke sana
                Navigator.pushReplacementNamed(context, '/home');
              }
            },
          ),
          ListTile(
            leading: Icon(Icons.qr_code),
            title: Text('Generate QR Code'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, '/qr_generator');
            },
          ),
          ListTile(
            leading: Icon(Icons.event_note),
            title: Text('Form Izin'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, '/izin');
            },
          ),
          ListTile(
            leading: Icon(Icons.calendar_today),
            title: Text('Form Cuti'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, '/cuti');
            },
          ),
          // Tambahkan menu Lembur
          ListTile(
            leading: Icon(Icons.access_time),
            title: Text('Form Lembur'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushReplacementNamed(context, '/lembur');
            },
          ),
          Divider(),
          ListTile(
            leading: Icon(Icons.logout, color: Colors.red),
            title: Text('Logout', style: TextStyle(color: Colors.red)),
            onTap: () async {
              // Tampilkan dialog konfirmasi
              bool confirm = await showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: Text('Konfirmasi Logout'),
                  content: Text('Apakah Anda yakin ingin keluar?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: Text('Batal'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: Text('Ya'),
                    ),
                  ],
                ),
              ) ?? false;
              
              if (confirm) {
                // Hapus data user
                await UserData.clearUserData();
                // Kembali ke halaman login
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
          ),
        ],
      ),
    );
  }
}