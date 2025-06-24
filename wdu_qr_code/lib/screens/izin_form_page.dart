import 'package:flutter/material.dart';
// import '../widgets/app_drawer.dart'; // Hapus import ini
import '../widgets/bottom_nav_bar.dart';

class IzinFormPage extends StatefulWidget {
  @override
  _IzinFormPageState createState() => _IzinFormPageState();
}

class _IzinFormPageState extends State<IzinFormPage> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _tanggalController = TextEditingController();
  final TextEditingController _alasanController = TextEditingController();
  DateTime? _selectedDate;
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    );
    _fadeController.forward();
  }

  @override
  void dispose() {
    _tanggalController.dispose();
    _alasanController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(DateTime.now().year + 1),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            primaryColor: Colors.blue.shade600,
            colorScheme: ColorScheme.light(primary: Colors.blue.shade600),
            buttonTheme: ButtonThemeData(textTheme: ButtonTextTheme.primary),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
        _tanggalController.text = "${picked.day}/${picked.month}/${picked.year}";
      });
    }
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(Icons.check_circle_outline, color: Colors.white),
              SizedBox(width: 8),
              Text('Pengajuan izin berhasil dikirim'),
            ],
          ),
          backgroundColor: Colors.green.shade600,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          margin: EdgeInsets.all(10),
        ),
      );
      
      _formKey.currentState!.reset();
      _tanggalController.clear();
      _alasanController.clear();
      setState(() {
        _selectedDate = null;
      });
    }
  }

  void _onNavItemTapped(int index) {
    if (index == 0) return; // Jika tab saat ini (Form Izin) diklik, tidak perlu navigasi
    
    switch (index) {
      case 1: // Form Cuti
        Navigator.pushReplacementNamed(context, '/cuti');
        break;
      case 2: // Scan QR
        Navigator.pushReplacementNamed(context, '/home');
        break;
      case 3: // Form Lembur
        Navigator.pushReplacementNamed(context, '/lembur');
        break;
      case 4: // Profil (bisa diganti dengan halaman profil jika ada)
        // Navigator.pushReplacementNamed(context, '/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          "Form Pengajuan Izin",
          style: TextStyle(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w600,
            fontSize: 20,
            letterSpacing: 0.5,
          ),
        ),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.blue.shade600,
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
          child: SingleChildScrollView(
            physics: BouncingScrollPhysics(),
            child: Padding(
              padding: EdgeInsets.all(20),
              child: FadeTransition(
                opacity: _fadeAnimation,
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                      Container(
                        padding: EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 20,
                              offset: Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                    Container(
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                                color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.blue.shade100),
                      ),
                      child: Row(
                        children: [
                                  Container(
                                    padding: EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.blue.shade100,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.info_outline_rounded,
                                      color: Colors.blue.shade700,
                                      size: 20,
                                    ),
                                  ),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              "Silahkan isi form pengajuan izin dengan lengkap",
                                      style: TextStyle(
                                        fontSize: 15,
                                        color: Colors.blue.shade900,
                                      ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 24),
                    
                            _buildFormLabel("Tanggal Izin"),
                    SizedBox(height: 8),
                    TextFormField(
                      controller: _tanggalController,
                      readOnly: true,
                      onTap: () => _selectDate(context),
                              decoration: _buildInputDecoration(
                                "Pilih tanggal",
                                Icons.calendar_today_rounded,
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Tanggal izin harus diisi';
                        }
                        return null;
                      },
                    ),
                    SizedBox(height: 20),
                    
                            _buildFormLabel("Alasan Izin"),
                    SizedBox(height: 8),
                    TextFormField(
                      controller: _alasanController,
                      maxLines: 4,
                              decoration: _buildInputDecoration(
                                "Tuliskan alasan izin",
                                Icons.description_rounded,
                              ).copyWith(
                                alignLabelWithHint: true,
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Alasan izin harus diisi';
                        } else if (value.length < 10) {
                          return 'Alasan terlalu singkat (min. 10 karakter)';
                        }
                        return null;
                      },
                    ),
                    SizedBox(height: 32),
                    
                    SizedBox(
                      width: double.infinity,
                              height: 54,
                      child: ElevatedButton(
                        onPressed: _submitForm,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blue.shade600,
                                  foregroundColor: Colors.white,
                                  elevation: 4,
                                  shadowColor: Colors.blue.withOpacity(0.4),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.send_rounded),
                                    SizedBox(width: 8),
                                    Text(
                          "Kirim Pengajuan",
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ],
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
            ),
          ),
        ),
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: 0, // Form Izin adalah tab pertama (indeks 0)
        onTap: _onNavItemTapped,
      ),
    );
  }

  Widget _buildFormLabel(String label) {
    return Text(
      label,
      style: TextStyle(
        fontWeight: FontWeight.w600,
        fontSize: 16,
        color: Colors.blue.shade900,
        letterSpacing: 0.3,
      ),
    );
  }

  InputDecoration _buildInputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      prefixIcon: Icon(icon, color: Colors.blue.shade400),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.blue.shade200),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.blue.shade200),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.blue.shade400, width: 2),
      ),
      filled: true,
      fillColor: Colors.blue.shade50.withOpacity(0.5),
      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    );
  }
}