import 'package:intl/intl.dart';

class TimeUtils {
  static String getCurrentTime() {
    return DateFormat('HH:mm:ss').format(DateTime.now());
  }
  
  static String formatCountdown(int seconds) {
    int minutes = seconds ~/ 60;
    int remainingSeconds = seconds % 60;
    return '$minutes:${remainingSeconds.toString().padLeft(2, '0')}';
  }
  
  static String getAbsenceType() {
    DateTime now = DateTime.now();
    if (now.hour >= 5 && now.hour < 17) {
      // Jam 5 pagi sampai sebelum jam 5 sore = absen masuk
      return 'masuk';
    } else {
      // Jam 5 sore ke atas = absen pulang
      return 'pulang';
    }
  }
}