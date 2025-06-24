import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserData {
  static String username = '';
  static String userId = '';
  static bool isLoggedIn = false;
  
  // Ubah return type menjadi Future<void>
  static Future<void> setUserData(String name, String id) async {
    username = name;
    userId = id;
    isLoggedIn = true;
    
    // Tambahkan await
    await _saveToPrefs(name, id);
  }
  
  // Method baru untuk menyimpan ke shared preferences
  static Future<void> _saveToPrefs(String name, String id) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('username', name);
    await prefs.setString('userId', id);
    await prefs.setBool('isLoggedIn', true);
  }
  
  // Method baru untuk memuat data user dari shared preferences
  static Future<bool> loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    username = prefs.getString('username') ?? '';
    userId = prefs.getString('userId') ?? '';
    isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
    
    return isLoggedIn;
  }
  
  // Method baru untuk menghapus data user (logout)
  static Future<void> clearUserData() async {
    username = '';
    userId = '';
    isLoggedIn = false;
    
    // Hapus dari shared preferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('username');
    await prefs.remove('userId');
    await prefs.setBool('isLoggedIn', false);
  }
}