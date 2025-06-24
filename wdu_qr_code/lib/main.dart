import 'package:flutter/material.dart';
// import 'screens/absensi_qr_page.dart'; // Hapus import ini jika tidak digunakan lagi
import 'screens/izin_form_page.dart';
import 'screens/cuti_form_page.dart';
import 'screens/login_page.dart';
import 'screens/qr_scanner_page.dart';
import 'screens/lembur_form_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QR Code Absensi',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        fontFamily: 'Roboto',
        cardTheme: CardTheme(
          elevation: 8,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ),
      home: LoginPage(),
      routes: {
        '/login': (context) => LoginPage(),
        '/home': (context) => QRScannerPage(),
        // Hapus '/qr_generator': (context) => AbsensiQRPage(),
        '/izin': (context) => IzinFormPage(),
        '/cuti': (context) => CutiFormPage(),
        '/lembur': (context) => LemburFormPage(),
      },
      debugShowCheckedModeBanner: false,
    );
  }
}