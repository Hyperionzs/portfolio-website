import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../utils/user_data.dart';
// import '../widgets/app_drawer.dart'; // Hapus import ini
import '../widgets/bottom_nav_bar.dart';

class QRScannerPage extends StatefulWidget {
  @override
  _QRScannerPageState createState() => _QRScannerPageState();
}

class _QRScannerPageState extends State<QRScannerPage> with SingleTickerProviderStateMixin {
  final MobileScannerController controller = MobileScannerController();
  bool isScanned = false;
  String scanResult = '';
  bool isTorchOn = false;
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _onNavItemTapped(int index) {
    if (index == 2) return; // Jika tab saat ini (Scan QR) diklik, tidak perlu navigasi
    
    switch (index) {
      case 0: // Form Izin
        Navigator.pushReplacementNamed(context, '/izin');
        break;
      case 1: // Form Cuti
        Navigator.pushReplacementNamed(context, '/cuti');
        break;
      case 3: // Form Lembur
        Navigator.pushReplacementNamed(context, '/lembur');
        break;
      case 4: // Profil (bisa diganti dengan halaman profil jika ada)
        // Navigator.pushReplacementNamed(context, '/profile');
        break;
    }
  }

  void _processQRData(String data) {
    if (isScanned) return;

    setState(() {
      isScanned = true;
      scanResult = data;
    });

    if (data.startsWith('ABSEN|')) {
      List<String> parts = data.split('|');
      if (parts.length >= 5) {
        String userId = parts[1];
        String type = parts[2];
        String timestamp = parts[3];
        String token = parts[4];

        Fluttertoast.showToast(
          msg: "Berhasil scan absen $type pada $timestamp",
          toastLength: Toast.LENGTH_LONG,
          gravity: ToastGravity.BOTTOM,
          backgroundColor: Colors.green.shade600,
          textColor: Colors.white,
        );
      }
    } else {
      Fluttertoast.showToast(
        msg: "QR Code tidak valid",
        toastLength: Toast.LENGTH_LONG,
        gravity: ToastGravity.BOTTOM,
        backgroundColor: Colors.red.shade600,
        textColor: Colors.white,
      );
    }

    Future.delayed(Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          isScanned = false;
          scanResult = '';
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Scan QR Absensi',
          style: TextStyle(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w600,
            fontSize: 20,
            letterSpacing: 0.5,
          ),
        ),
        backgroundColor: Colors.blue.shade600,
        elevation: 0,
        centerTitle: true,
        actions: [
          Container(
            margin: EdgeInsets.only(right: 8),
            child: IconButton(
              icon: AnimatedSwitcher(
                duration: Duration(milliseconds: 300),
                transitionBuilder: (Widget child, Animation<double> animation) {
                  return ScaleTransition(scale: animation, child: child);
                },
                child: Icon(
                  isTorchOn ? Icons.flash_on : Icons.flash_off,
                  key: ValueKey<bool>(isTorchOn),
                ),
              ),
              onPressed: () {
                controller.toggleTorch();
                setState(() {
                  isTorchOn = !isTorchOn;
                });
              },
            ),
          ),
        ],
      ),
      // Hapus drawer: AppDrawer(),
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
        child: Column(
          children: [
            Expanded(
              flex: 5,
              child: Container(
                margin: EdgeInsets.all(16),
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(32),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      spreadRadius: 2,
                        blurRadius: 15,
                      offset: Offset(0, 5),
                    ),
                  ],
                ),
                child: ClipRRect(
                    borderRadius: BorderRadius.circular(32),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      MobileScanner(
                        controller: controller,
                        onDetect: (capture) {
                          final List<Barcode> barcodes = capture.barcodes;
                          for (final barcode in barcodes) {
                            if (barcode.rawValue != null) {
                              _processQRData(barcode.rawValue!);
                              break;
                            }
                          }
                        },
                      ),
                        // Scanner corners with animated gradient border
                        Positioned.fill(
                          child: Container(
                            padding: EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: Colors.transparent,
                                width: 3,
                              ),
                              borderRadius: BorderRadius.circular(32),
                            ),
                            child: CustomPaint(
                              painter: ScannerCornersPainter(
                                borderColor: Colors.blue.shade400,
                                cornerSize: 40,
                              ),
                            ),
                          ),
                        ),
                        // Scanning animation line
                      AnimatedBuilder(
                        animation: _animationController,
                        builder: (context, child) {
                            final boxSize = MediaQuery.of(context).size.width * 0.7;
                          return Positioned(
                              top: boxSize * 0.1 + (boxSize * 0.8 * _animation.value),
                            child: Container(
                                width: boxSize,
                              height: 2,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.transparent,
                                      Colors.blue.shade400.withOpacity(0.8),
                                      Colors.blue.shade400,
                                      Colors.blue.shade400.withOpacity(0.8),
                                    Colors.transparent,
                                  ],
                                    stops: [0.0, 0.2, 0.5, 0.8, 1.0],
                                  begin: Alignment.centerLeft,
                                  end: Alignment.centerRight,
                                ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.blue.shade400.withOpacity(0.3),
                                      blurRadius: 8,
                                      spreadRadius: 2,
                                    ),
                                  ],
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Container(
                width: double.infinity,
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                        padding: EdgeInsets.all(20),
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.blue.shade100.withOpacity(0.5),
                              blurRadius: 15,
                              offset: Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                            Container(
                              padding: EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.blue.shade50,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                            Icons.qr_code_scanner,
                                size: 32,
                                color: Colors.blue.shade600,
                              ),
                          ),
                            SizedBox(height: 16),
                          Text(
                            'Arahkan kamera ke QR Code',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue.shade900,
                              ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'QR Code akan otomatis terdeteksi',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade600,
                                height: 1.2,
                              ),
                              textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                    if (isScanned)
                        AnimatedContainer(
                          duration: Duration(milliseconds: 300),
                          margin: EdgeInsets.only(top: 16),
                          padding: EdgeInsets.symmetric(vertical: 12, horizontal: 20),
                        decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.green.shade100.withOpacity(0.5),
                                blurRadius: 8,
                              offset: Offset(0, 3),
                            ),
                          ],
                        ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.check_circle,
                                color: Colors.green.shade600,
                                size: 20,
                              ),
                              SizedBox(width: 8),
                              Flexible(
                        child: Text(
                          'Berhasil scan: $scanResult',
                                  style: TextStyle(
                                    color: Colors.green.shade800,
                                    fontWeight: FontWeight.w500,
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
          ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: 2, // Scan QR adalah tab tengah (indeks 2)
        onTap: _onNavItemTapped,
      ),
    );
  }
}

class ScannerCornersPainter extends CustomPainter {
  final Color borderColor;
  final double cornerSize;

  ScannerCornersPainter({
    required this.borderColor,
    required this.cornerSize,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;

    final double padding = 16.0;
    final double adjustedCornerSize = cornerSize - padding;

    // Top left corner
    canvas.drawPath(
      Path()
        ..moveTo(padding, adjustedCornerSize)
        ..lineTo(padding, padding)
        ..lineTo(adjustedCornerSize, padding),
      paint,
    );

    // Top right corner
    canvas.drawPath(
      Path()
        ..moveTo(size.width - adjustedCornerSize, padding)
        ..lineTo(size.width - padding, padding)
        ..lineTo(size.width - padding, adjustedCornerSize),
      paint,
    );

    // Bottom left corner
    canvas.drawPath(
      Path()
        ..moveTo(padding, size.height - adjustedCornerSize)
        ..lineTo(padding, size.height - padding)
        ..lineTo(adjustedCornerSize, size.height - padding),
      paint,
    );

    // Bottom right corner
    canvas.drawPath(
      Path()
        ..moveTo(size.width - adjustedCornerSize, size.height - padding)
        ..lineTo(size.width - padding, size.height - padding)
        ..lineTo(size.width - padding, size.height - adjustedCornerSize),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
