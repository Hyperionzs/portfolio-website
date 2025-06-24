import 'dart:math';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:intl/intl.dart';

class QRGenerator {
  static String generateToken(int userId) {
    // Membuat token unik berdasarkan waktu dan ID pengguna
    final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
    final random = Random().nextInt(10000).toString();
    final data = '$userId-$timestamp-$random';
    
    // Menghasilkan token dengan SHA-256
    final bytes = utf8.encode(data);
    final digest = sha256.convert(bytes);
    return digest.toString().substring(0, 16); // Mengambil 16 karakter pertama
  }
  
  static String generateQRData(int userId, String type, String token) {
    String timestamp = DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now());
    return 'ABSEN|$userId|$type|$timestamp|$token';
  }
}