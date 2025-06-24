import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;
import 'dart:async';
import 'dart:developer' as developer;

class NotificationService {
  static late NotificationService _instance;
  static NotificationService get instance {
    try {
      return _instance;
    } catch (e) {
      _instance = NotificationService._internal();
      return _instance;
    }
  }
  
  late final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin;
  bool _isInitialized = false;
  Timer? _checkTimer;

  NotificationService._internal() {
    flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
  }

  Future<void> init() async {
    if (_isInitialized) return;
    
    tz.initializeTimeZones();
    
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
        
    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await flutterLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (details) async {
        // Handle notification tap
      },
    );

    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'pulang_reminder_channel',
      'Reminder Pulang',
      description: 'Notifikasi pengingat waktu pulang',
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
      showBadge: true,
      enableLights: true,
    );

    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);
    
    _isInitialized = true;

    // Mulai timer untuk mengecek waktu
    _startCheckingTime();
  }

  void _startCheckingTime() {
    _checkTimer?.cancel();
    _checkTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      _checkAndShowNotification();
    });
  }

  Future<void> _checkAndShowNotification() async {
    final now = DateTime.now();
    developer.log('Checking time: ${now.hour}:${now.minute}');

    // Jika waktu menunjukkan 23:10
    if (now.hour == 23 && now.minute == 10) {
      developer.log('Time matched! Showing notification...');
      await showPulangNotification();
    }
  }

  Future<void> showPulangNotification() async {
    developer.log('Attempting to show notification...');
    
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'pulang_reminder_channel',
      'Reminder Pulang',
      channelDescription: 'Notifikasi pengingat waktu pulang',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
      fullScreenIntent: true,
      visibility: NotificationVisibility.public,
      category: AndroidNotificationCategory.alarm,
      autoCancel: false,
      ongoing: true,
    );

    const NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    try {
      await flutterLocalNotificationsPlugin.show(
        0,
        'Waktu Pulang',
        'Jangan lupa untuk scan QR code absen pulang!',
        platformChannelSpecifics,
      );
      developer.log('Notification shown successfully');
    } catch (e) {
      developer.log('Error showing notification: $e');
    }
  }

  Future<void> requestPermissions() async {
    if (!_isInitialized) await init();
    
    final platform = flutterLocalNotificationsPlugin.resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    if (platform != null) {
      await platform.requestNotificationsPermission();
    }
  }

  Future<void> schedulePulangNotification() async {
    if (!_isInitialized) await init();
    
    await flutterLocalNotificationsPlugin.cancelAll();

    final now = DateTime.now();
    
    // Set notification time to 23:10
    var scheduledTime = DateTime(
      now.year,
      now.month,
      now.day,
      23,
      10,
    );

    // If current time is past 23:10, schedule for next day
    if (now.isAfter(scheduledTime)) {
      scheduledTime = scheduledTime.add(const Duration(days: 1));
    }

    developer.log('Scheduling notification for: ${scheduledTime.toString()}');

    final androidPlatformChannelSpecifics = AndroidNotificationDetails(
      'pulang_reminder_channel',
      'Reminder Pulang',
      channelDescription: 'Notifikasi pengingat waktu pulang',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
      fullScreenIntent: true,
      visibility: NotificationVisibility.public,
      category: AndroidNotificationCategory.alarm,
      autoCancel: false,
      ongoing: true,
    );

    final NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    try {
      await flutterLocalNotificationsPlugin.zonedSchedule(
        0,
        'Waktu Pulang',
        'Jangan lupa untuk scan QR code absen pulang!',
        tz.TZDateTime.from(scheduledTime, tz.local),
        platformChannelSpecifics,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        matchDateTimeComponents: DateTimeComponents.time,
      );
      developer.log('Notification scheduled successfully');
    } catch (e) {
      developer.log('Error scheduling notification: $e');
    }
  }

  void dispose() {
    _checkTimer?.cancel();
  }
} 