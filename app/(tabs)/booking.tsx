import { bookingService, BookingData } from '@/services/bookingService';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FormData {
  name: string;
  address: string;
  phone: string;
  adults: string;
  children: string;
  transportPlate: string;
  checkIn: string;
  checkOut: string;
  rooms: string[]; // Changed from 'room: string[]' to 'rooms: string[]' for clarity
  paymentType: 'deposit' | 'full';
}

interface FormErrors {
  [key: string]: string;
}

const rooms = [
  { id: 'seroja', name: 'Seroja', description: 'Elegant room with garden view' },
  { id: 'dahlia', name: 'Dahlia', description: 'Spacious room with balcony' },
  { id: 'adelia', name: 'Adelia', description: 'Luxury suite with premium amenities' },
];

export default function BookingForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    phone: '',
    adults: '1',
    children: '0',
    transportPlate: '',
    checkIn: '',
    checkOut: '',
    rooms: [], // Changed from room: '' to rooms: []
    paymentType: 'deposit',
  });

  const [loading,setLoading] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Regular handleChange for text inputs
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // ========================================
  // ADD THIS: Toggle function for multiple room selection
  // This function handles selecting/deselecting rooms
  // ========================================
  const toggleRoom = (roomId: string) => {
    setFormData((prev) => {
      const currentRooms = prev.rooms;
      const isSelected = currentRooms.includes(roomId);
      
      return {
        ...prev,
        rooms: isSelected
          ? currentRooms.filter((id) => id !== roomId)  // Remove if already selected
          : [...currentRooms, roomId],                   // Add if not selected
      };
    });
    
    // Clear room error when user selects a room
    if (errors.rooms) {
      setErrors((prev) => ({
        ...prev,
        rooms: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-+()]+$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Adults validation
    if (parseInt(formData.adults) < 1) {
      newErrors.adults = 'At least 1 adult is required';
    }

    // Check-in date validation
    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    }

    // Check-out date validation
    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    } else if (formData.checkIn && formData.checkOut <= formData.checkIn) {
      newErrors.checkOut = 'Check-out must be after check-in date';
    }

    // Room validation - UPDATED for multiple rooms
    if (formData.rooms.length === 0) {
      newErrors.rooms = 'Please select at least one room';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to generate next booking ID
  const generateBookingId = async () => {
    try{
      // get all bookings to find the highest ID
      const result = await  bookingService.getAllBookings();

      if(result.success && result.data && result.data.length > 0) { 
        // Find the highest booking ID number
      const maxId = Math.max(
        ...result.data
          .map(doc => doc.bookingId)
          .filter(id => id !== null && id !== undefined)
      );

      return maxId + 1 ;
      }

      // if no booking exist , start from 1
      return 1;
    } catch (error){
      console.error('Error generating booking ID:', error);
      return Date.now(); // Fallback to timestamp
    }
  };

  const handleSubmit = async() => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try{
      //generate new booking ID
      const newBookingId = await generateBookingId();
      //Calculate the booking amount
      const amount = bookingService.calculateAmount(
        formData.rooms,
        formData.checkIn,
        formData.checkOut,
        parseInt(formData.adults),
        parseInt(formData.children)
      );

      // Prepare data for Appwrite
      const bookingData: BookingData = {
      // bookingId:newBookingId,
      fullName: formData.name,                        // Changed
      address: formData.address,
      phoneNumber: formData.phone,                    // Changed
      numberOfAdults: parseInt(formData.adults),      // Changed
      numberOfChildren: parseInt(formData.children),  // Changed
      vehicleLicensePlate: formData.transportPlate || undefined, // Changed
      checkin: formData.checkIn,                      // Changed (lowercase)
      checkout: formData.checkOut,                    // Changed (lowercase)
      Rooms: formData.rooms,                          // Changed (capital R)
      deposit: 'Pending',                  // This is required
      fullpayment: formData.paymentType === 'full' ? 'full' : undefined, // Optional
    };
    
    console.log('Submitting booking:', bookingData);

    // Save to AppWrite
    const result = await bookingService.createBooking(bookingData);

    if (result.success) {
      setSubmitted(true);
      Alert.alert('Success', 'Booking created successfully!');
    } else {
      Alert.alert('Error', result.error || 'Failed to create booking');
    }
  } catch (error) {
    console.error('Submission error:', error);
    Alert.alert('Error', 'An unexpected error occurred');
  } finally {
    setLoading(false);
  }

  };

  const handleReset = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      adults: '1',
      children: '0',
      transportPlate: '',
      checkIn: '',
      checkOut: '',
      rooms: [], // Changed from room: '' to rooms: []
      paymentType: 'deposit',
    });
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    // UPDATED: Get all selected rooms instead of single room
    const selectedRooms = rooms.filter((r) => formData.rooms.includes(r.id));
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successCheckmark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Thank you, {formData.name}. Your booking has been received.
          </Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Room(s):</Text>
              <Text style={styles.summaryValue}>
                {selectedRooms.map((r) => r.name).join(', ')}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-in:</Text>
              <Text style={styles.summaryValue}>{formData.checkIn}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-out:</Text>
              <Text style={styles.summaryValue}>{formData.checkOut}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Guests:</Text>
              <Text style={styles.summaryValue}>
                {formData.adults} Adult(s), {formData.children} Child(ren)
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Make Another Booking</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hotel Booking Form</Text>
          <Text style={styles.headerSubtitle}>
            Complete the form below to reserve your room
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Personal Information</Text>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={[styles.textArea, errors.address && styles.inputError]}
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                placeholder="Enter your address"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>📞 Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>
          </View>

          {/* Booking Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏨 Booking Details</Text>

            {/* Number of Guests */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>👥 Adults *</Text>
                <TextInput
                  style={[styles.input, errors.adults && styles.inputError]}
                  value={formData.adults}
                  onChangeText={(value) => handleChange('adults', value)}
                  keyboardType="number-pad"
                />
                {errors.adults && <Text style={styles.errorText}>{errors.adults}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Children</Text>
                <TextInput
                  style={styles.input}
                  value={formData.children}
                  onChangeText={(value) => handleChange('children', value)}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Transport Plate */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🚗 Vehicle Plate Number (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.transportPlate}
                onChangeText={(value) => handleChange('transportPlate', value)}
                placeholder="ABC-1234"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
            </View>

            {/* Dates */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>📅 Check-in Date *</Text>
                <TextInput
                  style={[styles.input, errors.checkIn && styles.inputError]}
                  value={formData.checkIn}
                  onChangeText={(value) => handleChange('checkIn', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
                {errors.checkIn && <Text style={styles.errorText}>{errors.checkIn}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>📅 Check-out Date *</Text>
                <TextInput
                  style={[styles.input, errors.checkOut && styles.inputError]}
                  value={formData.checkOut}
                  onChangeText={(value) => handleChange('checkOut', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
                {errors.checkOut && <Text style={styles.errorText}>{errors.checkOut}</Text>}
              </View>
            </View>

            {/* ========================================
                UPDATED: Room Selection - Multiple Rooms
                USE toggleRoom() function here instead of handleChange()
                ======================================== */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Room(s) * (Multiple allowed)</Text>
              <Text style={styles.helperText}>
                Tap to select or deselect rooms. You can book multiple rooms.
              </Text>
              
              {rooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={[
                    styles.roomCard,
                    formData.rooms.includes(room.id) && styles.roomCardSelected,
                  ]}
                  onPress={() => toggleRoom(room.id)} // CHANGED: Use toggleRoom instead of handleChange
                >
                  <View style={styles.roomCardContent}>
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      <Text style={styles.roomDescription}>{room.description}</Text>
                    </View>
                    {formData.rooms.includes(room.id) && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              
              {/* Show selected count */}
              {formData.rooms.length > 0 && (
                <View style={styles.selectedRoomsContainer}>
                  <Text style={styles.selectedRoomsText}>
                    {formData.rooms.length} room(s) selected
                  </Text>
                </View>
              )}
              
              {errors.rooms && <Text style={styles.errorText}>{errors.rooms}</Text>}
            </View>
          </View>

          {/* Payment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Payment Type</Text>

            <View style={styles.paymentRow}>
              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  formData.paymentType === 'deposit' && styles.paymentCardSelected,
                ]}
                onPress={() => handleChange('paymentType', 'deposit')}
              >
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentTitle}>Deposit</Text>
                  <Text style={styles.paymentSubtitle}>Pay partial amount now</Text>
                </View>
                {formData.paymentType === 'deposit' && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  formData.paymentType === 'full' && styles.paymentCardSelected,
                ]}
                onPress={() => handleChange('paymentType', 'full')}
              >
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentTitle}>Full Payment</Text>
                  <Text style={styles.paymentSubtitle}>Pay complete amount now</Text>
                </View>
                {formData.paymentType === 'full' && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Complete Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#C7D2FE',
  },
  formContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  roomCard: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  roomCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  roomCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  roomDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedRoomsContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  selectedRoomsText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  paymentRow: {
    gap: 12,
  },
  paymentCard: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successCheckmark: {
    fontSize: 40,
    color: '#10B981',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  resetButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});