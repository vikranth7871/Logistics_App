import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000/api/v1'; // 10.0.2.2 for Android Emulator, localhost for iOS Sim

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  Future<Map<String, String>> _headers() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final body = jsonDecode(response.body);
      final data = body['data'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('access_token', data['access_token']);
      await prefs.setString('refresh_token', data['refresh_token']);
      await prefs.setString('user_name', data['user']['name']);
      await prefs.setString('user_role', data['user']['role']);
      return data;
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['message'] ?? 'Login failed');
    }
  }

  Future<List<dynamic>> getAssignedTrips() async {
    final headers = await _headers();
    final response = await http.get(
      Uri.parse('$baseUrl/trips'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      return body['data']['items'] ?? [];
    } else {
      throw Exception('Failed to load trips');
    }
  }

  Future<Map<String, dynamic>> startTrip(String tripId, double? odometer) async {
    final headers = await _headers();
    final response = await http.post(
      Uri.parse('$baseUrl/trips/$tripId/start'),
      headers: headers,
      body: jsonEncode({'odometer': odometer}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body)['data'];
    } else {
      throw Exception('Failed to start trip');
    }
  }

  Future<Map<String, dynamic>> deliverTrip(String tripId) async {
    final headers = await _headers();
    final response = await http.post(
      Uri.parse('$baseUrl/trips/$tripId/deliver'),
      headers: headers,
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body)['data'];
    } else {
      throw Exception('Failed to deliver trip');
    }
  }

  Future<Map<String, dynamic>> addFuelEntry(Map<String, dynamic> data) async {
    final headers = await _headers();
    final response = await http.post(
      Uri.parse('$baseUrl/fuel'),
      headers: headers,
      body: jsonEncode(data),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body)['data'];
    } else {
      throw Exception('Failed to record fuel');
    }
  }

  Future<Map<String, dynamic>> addExpense(Map<String, dynamic> data) async {
    final headers = await _headers();
    final response = await http.post(
      Uri.parse('$baseUrl/expenses'),
      headers: headers,
      body: jsonEncode(data),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body)['data'];
    } else {
      throw Exception('Failed to record expense');
    }
  }
}
