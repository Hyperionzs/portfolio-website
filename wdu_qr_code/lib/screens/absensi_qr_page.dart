import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'dart:async';
import '../utils/qr_generator.dart';
import '../utils/time_utils.dart';
import '../widgets/app_drawer.dart';
import '../utils/user_data.dart';

class AbsensiQRPage extends StatefulWidget {
  @override
  _AbsensiQRPageState createState() => _AbsensiQRPageState();
}

class _AbsensiQRPageState extends State<AbsensiQRPage> with SingleTickerProviderStateMixin {
  // Ganti dengan ID user dinamis dari UserData
  late int userId;
  String type = 'masuk'; // Default 'masuk'
  String currentTime = '';
  String qrData = '';
  Timer? _timer;
  bool isScanned = false;
  String scanMessage = '';
  int secondsRemaining = 60; // Countdown 1 menit untuk QR
  String token = '';
  bool showPulangNotification = false;
  int pulangCountdown = 0; // Countdown untuk notifikasi pulang (dalam detik)
  AnimationController? _animationController;
  Animation<double>? _animation;
  late AnimationController _scanAnimationController;
  late Animation<double> _scanAnimation;
  
  @override
  void initState() {
    super.initState();
    // Menggunakan ID dari UserData, dengan fallback ke 123 jika kosong
    userId = int.tryParse(UserData.userId) ?? 123;
    // Set waktu awal
    updateCurrentTime();
    
    // Generate QR data awal
    generateQRData();
    
    // Inisialisasi animasi
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    
    _animation = Tween<double>(begin: 0.97, end: 1.03).animate(
      CurvedAnimation(parent: _animationController!, curve: Curves.easeInOut)
    )..addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _animationController!.reverse();
      } else if (status == AnimationStatus.dismissed) {
        _animationController!.forward();
      }
    });
    
    // Mulai animasi
    _animationController!.forward();
    
    // Timer untuk memperbarui waktu setiap detik dan countdown
    _timer = Timer.periodic(Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          updateCurrentTime();
          
          // Countdown untuk pembaruan QR code
          secondsRemaining--;
          if (secondsRemaining <= 0) {
            secondsRemaining = 60; // Reset ke 1 menit
            generateQRData(); // Generate QR baru setiap 1 menit
          }
          
          // Update untuk notifikasi pulang (16:50)
          DateTime now = DateTime.now();
          if (now.hour == 16 && now.minute >= 50) {
            showPulangNotification = true;
            // Hitung countdown sampai 17:00 (beri waktu 10 menit)
            pulangCountdown = ((17 * 60 * 60)) - 
                            (now.hour * 60 * 60 + now.minute * 60 + now.second);
          } else {
            // Reset notifikasi jika sudah lewat jam 17:00 atau belum jam 16:50
            showPulangNotification = false;
          }
        });
      }
    });

    // Inisialisasi animasi scan
    _scanAnimationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    _scanAnimation = Tween<double>(
      begin: 0.0,
      end: 2.0,
    ).animate(_scanAnimationController);
  }
  
  void updateCurrentTime() {
    currentTime = TimeUtils.getCurrentTime();
    
    // Otomatis mengubah tipe absen berdasarkan waktu
    String newType = TimeUtils.getAbsenceType();
    if (type != newType) {
      setState(() {
        type = newType;
        generateQRData();
      });
    }
  }
  
  @override
  void dispose() {
    // Membersihkan timer dan controller ketika widget dihapus
    _timer?.cancel();
    _animationController?.dispose();
    _scanAnimationController.dispose();
    super.dispose();
  }
  
  void generateQRData() {
    token = QRGenerator.generateToken(userId);
    qrData = QRGenerator.generateQRData(userId, type, token);
  }
  
  void simulateScan() {
    // Fungsi ini hanya untuk simulasi scan QR code
    setState(() {
      isScanned = true;
      scanMessage = 'Berhasil scan pada $currentTime';
      
      // Generate QR baru setelah di-scan
      generateQRData();
      secondsRemaining = 60; // Reset countdown
      
      // Reset status setelah 3 detik
      Future.delayed(Duration(seconds: 3), () {
        if (mounted) {
          setState(() {
            isScanned = false;
            scanMessage = '';
          });
        }
      });
    });
  }
  
  Widget _buildQRCodeWithScanAnimation() {
    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 15,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              QrImageView(
                data: qrData,
                version: QrVersions.auto,
                size: 240.0,
                backgroundColor: Colors.white,
                errorCorrectionLevel: QrErrorCorrectLevel.H,
              ),
              // Garis sudut kiri atas
              Positioned(
                top: 0,
                left: 0,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    border: Border(
                      left: BorderSide(color: Colors.blue.shade600, width: 4),
                      top: BorderSide(color: Colors.blue.shade600, width: 4),
                    ),
                  ),
                ),
              ),
              // Garis sudut kanan atas
              Positioned(
                top: 0,
                right: 0,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    border: Border(
                      right: BorderSide(color: Colors.blue.shade600, width: 4),
                      top: BorderSide(color: Colors.blue.shade600, width: 4),
                    ),
                  ),
                ),
              ),
              // Garis sudut kiri bawah
              Positioned(
                bottom: 0,
                left: 0,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    border: Border(
                      left: BorderSide(color: Colors.blue.shade600, width: 4),
                      bottom: BorderSide(color: Colors.blue.shade600, width: 4),
                    ),
                  ),
                ),
              ),
              // Garis sudut kanan bawah
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    border: Border(
                      right: BorderSide(color: Colors.blue.shade600, width: 4),
                      bottom: BorderSide(color: Colors.blue.shade600, width: 4),
                    ),
                  ),
                ),
              ),
              // Animasi garis scan
              AnimatedBuilder(
                animation: _scanAnimation,
                builder: (context, child) {
                  return Positioned(
                    top: _scanAnimation.value * 240,
                    child: Container(
                      height: 2,
                      width: 240,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.blue.shade600.withOpacity(0),
                            Colors.blue.shade600.withOpacity(0.8),
                            Colors.blue.shade600.withOpacity(0),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        // Timer countdown di bawah QR
        Positioned(
          bottom: 8,
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.black87,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black12,
                  blurRadius: 8,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.timer_outlined,
                  color: Colors.white,
                  size: 18,
                ),
                SizedBox(width: 6),
                Text(
                  "$secondsRemaining detik",
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          "QR Code Absensi",
          style: TextStyle(
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.blue.shade600,
      ),
      drawer: AppDrawer(), // Tambahkan drawer di sini
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.blue.shade600,
              Colors.blue.shade50,
              Colors.white,
            ],
            stops: [0.0, 0.2, 1.0],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            physics: BouncingScrollPhysics(),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                children: [
                  // Notifikasi waktu pulang
                  if (showPulangNotification)
                    AnimatedBuilder(
                      animation: _animation!,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: _animation!.value,
                          child: Container(
                            margin: EdgeInsets.only(bottom: 24),
                            padding: EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.red.withOpacity(0.2),
                                  blurRadius: 12,
                                  offset: Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: Colors.red.shade100,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        Icons.notifications_active,
                                        color: Colors.red.shade700,
                                        size: 24,
                                      ),
                                    ),
                                    SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                        "Waktu pulang segera tiba!",
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                              fontSize: 18,
                                          color: Colors.red.shade800,
                                        ),
                                          ),
                                          SizedBox(height: 4),
                                          Text(
                                            "Jangan lupa scan QR untuk absen pulang",
                                            style: TextStyle(
                                              fontSize: 14,
                                              color: Colors.red.shade700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(height: 12),
                                Container(
                                  padding: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                                  decoration: BoxDecoration(
                                    color: Colors.red.shade100,
                                    borderRadius: BorderRadius.circular(12),
                                ),
                                  child: Text(
                                  TimeUtils.formatCountdown(pulangCountdown),
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.red.shade800,
                                      letterSpacing: 1,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  
                  // Card QR Code
                  Card(
                    elevation: 8,
                    shadowColor: Colors.black26,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Column(
                        children: [
                          Container(
                            margin: EdgeInsets.only(bottom: 20),
                            padding: EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.blue.shade50,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.blue.shade100),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.blue.withOpacity(0.1),
                                  blurRadius: 8,
                                  offset: Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: Colors.blue.shade100,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        Icons.info_outline,
                                        color: Colors.blue.shade700,
                                        size: 20,
                                      ),
                                    ),
                                    SizedBox(width: 12),
                                    Text(
                                      "Informasi QR Code",
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.blue.shade800,
                                      ),
                                    ),
                                  ],
                                ),
                                Divider(
                                  color: Colors.blue.shade100,
                                  thickness: 1,
                                  height: 24,
                                ),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.refresh,
                                      color: Colors.blue.shade400,
                                      size: 16,
                                    ),
                                    SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        "QR code diperbarui setiap 1 menit atau setelah di-scan",
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: Colors.blue.shade800,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          
                          // Replace the old QR stack with the new animated one
                          _buildQRCodeWithScanAnimation(),
                          
                          SizedBox(height: 24),
                          
                          Container(
                            padding: EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade50,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.grey.shade200),
                            ),
                            child: Column(
                            children: [
                                _buildInfoRow(
                                  Icons.person_outline,
                                "ID: $userId",
                                  Colors.blue.shade700,
                          ),
                                SizedBox(height: 12),
                                _buildInfoRow(
                                  Icons.access_time,
                                  "Waktu: $currentTime",
                                  Colors.blue.shade700,
                          ),
                                SizedBox(height: 12),
                                _buildInfoRow(
                                  Icons.vpn_key_outlined,
                                "Token: ${token.substring(0, 8)}...",
                                  Colors.grey.shade700,
                                ),
                              ],
                              ),
                          ),
                          
                          // Menampilkan pesan setelah scan
                          if (isScanned)
                            Container(
                              margin: EdgeInsets.only(top: 20),
                              padding: EdgeInsets.symmetric(vertical: 12, horizontal: 20),
                              decoration: BoxDecoration(
                                color: Colors.green.shade50,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.green.shade200),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.green.withOpacity(0.1),
                                    blurRadius: 8,
                                    offset: Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    padding: EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.green.shade100,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.check_circle_outline,
                                      color: Colors.green.shade700,
                                      size: 20,
                                    ),
                                  ),
                                  SizedBox(width: 12),
                                  Flexible(
                                    child: Text(
                                    scanMessage,
                                    style: TextStyle(
                                      fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                      color: Colors.green.shade800,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  
                  SizedBox(height: 24),
                  
                  // Tombol untuk simulasi scan (hanya untuk testing)
                  ElevatedButton.icon(
                    onPressed: simulateScan,
                    icon: Icon(Icons.qr_code_scanner_rounded),
                    label: Text(
                      "Simulasi Scan QR",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue.shade600,
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 4,
                      shadowColor: Colors.blue.withOpacity(0.4),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
  
  Widget _buildInfoRow(IconData icon, String text, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, color: color, size: 20),
        SizedBox(width: 8),
        Text(
          text,
          style: TextStyle(
            fontSize: 16,
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}