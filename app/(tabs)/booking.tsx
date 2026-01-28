import { BookingData, bookingService } from "@/services/bookingService";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BookingHeader from "../components/Bookingheader";

interface FormData {
  name: string;
  address: string;
  phone: string;
  adults: string;
  children: string;
  transportPlate: string;
  checkIn: string;
  checkOut: string;
  rooms: string[];
  paymentType: "deposit" | "full" | "";
  depositAmount: string; // ✅ FIXED: Matches interface
}

interface FormErrors {
  [key: string]: string;
}

const rooms = [
  {
    id: "seroja",
    name: "Seroja",
    description: "Elegant room with garden view",
  },
  { id: "dahlia", name: "Dahlia", description: "Spacious room with balcony" },
  {
    id: "adelia",
    name: "Adelia",
    description: "Luxury suite with premium amenities",
  },
];

export default function BookingForm() {
  // ✅ FIXED: Correct initial state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    phone: "",
    adults: "1",
    children: "0",
    transportPlate: "",
    checkIn: "",
    checkOut: "",
    rooms: [],
    paymentType: "",
    depositAmount: "", // ✅ FIXED: Changed from 'deposit'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());

  // ========================================
  // ✅ NEW: CALCULATE BOOKING AMOUNTS
  // ========================================
  const calculateBookingAmounts = () => {
    // Get total cost from service
    const total = bookingService.calculateAmount(
      formData.rooms,
      formData.checkIn,
      formData.checkOut,
    );

    let depositAmount = 0;
    let balance = 0;

    if (formData.paymentType === "full") {
      // Full payment - deposit equals total
      depositAmount = total;
      balance = 0;
    } else if (formData.paymentType === "deposit") {
      // Partial deposit
      depositAmount = parseFloat(formData.depositAmount) || 0;
      balance = Math.max(0, total - depositAmount);
    }

    return {
      total,
      depositAmount,
      balance,
    };
  };

  // Date handlers
  const onCheckInChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowCheckInPicker(false);
    }

    if (selectedDate) {
      setCheckInDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, checkIn: formattedDate }));

      if (errors.checkIn) {
        setErrors((prev) => ({ ...prev, checkIn: "" }));
      }
    }
  };

  const onCheckOutChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowCheckOutPicker(false);
    }

    if (selectedDate) {
      setCheckOutDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, checkOut: formattedDate }));

      if (errors.checkOut) {
        setErrors((prev) => ({ ...prev, checkOut: "" }));
      }
    }
  };

  const clearCheckInDate = () => {
    setFormData((prev) => ({ ...prev, checkIn: "" }));
    setCheckInDate(new Date());
  };

  const clearCheckOutDate = () => {
    setFormData((prev) => ({ ...prev, checkOut: "" }));
    setCheckOutDate(new Date());
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleRoom = (roomId: string) => {
    setFormData((prev) => {
      const currentRooms = prev.rooms;
      const isSelected = currentRooms.includes(roomId);

      return {
        ...prev,
        rooms: isSelected
          ? currentRooms.filter((id) => id !== roomId)
          : [...currentRooms, roomId],
      };
    });

    if (errors.rooms) {
      setErrors((prev) => ({ ...prev, rooms: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    const phoneRegex = /^[\d\s\-+()]+$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (parseInt(formData.adults) < 1) {
      newErrors.adults = "At least 1 adult is required";
    }

    if (!formData.checkIn) {
      newErrors.checkIn = "Check-in date is required";
    }

    if (!formData.checkOut) {
      newErrors.checkOut = "Check-out date is required";
    } else if (formData.checkIn && formData.checkOut <= formData.checkIn) {
      newErrors.checkOut = "Check-out must be after check-in date";
    }

    if (formData.rooms.length === 0) {
      newErrors.rooms = "Please select at least one room";
    }

    if (!formData.paymentType) {
      newErrors.paymentType = "Please select a payment type";
    }

    if (formData.paymentType === "deposit") {
      if (!formData.depositAmount.trim()) {
        newErrors.depositAmount = "Deposit amount is required";
      } else if (
        isNaN(parseFloat(formData.depositAmount)) ||
        parseFloat(formData.depositAmount) <= 0
      ) {
        newErrors.depositAmount = "Please enter a valid amount";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // ✅ FIXED: SUBMIT HANDLER WITH PROPER CALCULATIONS
  // ========================================
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors before submitting",
      );
      return;
    }

    setLoading(true);

    try {
      // Calculate all amounts
      const amounts = calculateBookingAmounts();

      console.log("Calculated amounts:", amounts);

      // ✅ FIXED: Proper BookingData structure
      const bookingData: BookingData = {
        fullName: formData.name,
        address: formData.address,
        phoneNumber: formData.phone,
        NumAdults: parseInt(formData.adults) || 0,
        NumChildren: parseInt(formData.children) || 0,
        vehicleLicensePlate: formData.transportPlate || undefined,
        checkin: formData.checkIn,
        checkout: formData.checkOut,
        Rooms: formData.rooms,

        // ✅ FIXED: Numeric fields with proper calculations
        total: amounts.total,
        balance: amounts.balance,

        // ✅ FIXED: Status fields (strings, not numbers)
        deposit: amounts.depositAmount,
        status: amounts.balance > 0 ? "pending" : "completed",

        // ✅ ADDED: Payment type
        paymentType:
          formData.paymentType === "" ? undefined : formData.paymentType,
      };

      console.log("Submitting booking:", bookingData);

      const result = await bookingService.createBooking(bookingData);

      console.log("Submission result:", result);

      if (result.success) {
        setSubmitted(true);
        Alert.alert(
          "Success",
          `Booking created successfully!

Total: RM ${amounts.total.toFixed(2)}
Deposit Paid: RM ${amounts.depositAmount.toFixed(2)}
Balance: RM ${amounts.balance.toFixed(2)}`,
        );
      } else {
        console.error("Booking creation failed:", result.error);
        Alert.alert("Error", result.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      adults: "1",
      children: "0",
      transportPlate: "",
      checkIn: "",
      checkOut: "",
      rooms: [],
      paymentType: "",
      depositAmount: "",
    });
    setErrors({});
    setSubmitted(false);
    setCheckInDate(new Date());
    setCheckOutDate(new Date());
  };

  if (submitted) {
    const selectedRooms = rooms.filter((r) => formData.rooms.includes(r.id));
    const amounts = calculateBookingAmounts();
    

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
                {selectedRooms.map((r) => r.name).join(", ")}
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

            {/* ✅ ADDED: Show financial details */}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={[styles.summaryValue, styles.amountText]}>
                RM {amounts.total.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Deposit Paid:</Text>
              <Text style={[styles.summaryValue, styles.paidText]}>
                RM {amounts.depositAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Balance Due:</Text>
              <Text style={[styles.summaryValue, styles.balanceText]}>
                RM {amounts.balance.toFixed(2)}
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
      <BookingHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => handleChange("name", value)}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={[styles.textArea, errors.address && styles.inputError]}
                value={formData.address}
                onChangeText={(value) => handleChange("address", value)}
                placeholder="Enter your address"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📞 Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={formData.phone}
                onChangeText={(value) => handleChange("phone", value)}
                placeholder="+60-019-XXX-XXXX"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>
          </View>

          {/* Booking Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏨 Booking Details</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>👥 Adults *</Text>
                <TextInput
                  style={[styles.input, errors.adults && styles.inputError]}
                  value={formData.adults}
                  onChangeText={(value) => handleChange("adults", value)}
                  keyboardType="number-pad"
                />
                {errors.adults && (
                  <Text style={styles.errorText}>{errors.adults}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>👶 Children</Text>
                <TextInput
                  style={styles.input}
                  value={formData.children}
                  onChangeText={(value) => handleChange("children", value)}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                🚗 Vehicle Plate Number (Optional)
              </Text>
              <TextInput
                style={styles.input}
                value={formData.transportPlate}
                onChangeText={(value) => handleChange("transportPlate", value)}
                placeholder="ABC-1234"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
            </View>

            {/* Dates - Same as before */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>📅 Check-in Date *</Text>
                <View style={styles.dateInputContainer}>
                  <TouchableOpacity
                    style={[
                      styles.datePickerButton,
                      errors.checkIn && styles.inputError,
                    ]}
                    onPress={() => {
                      setShowCheckOutPicker(false);
                      setShowCheckInPicker(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.datePickerText,
                        !formData.checkIn && styles.placeholderText,
                      ]}
                    >
                      {formData.checkIn || "Select date"}
                    </Text>
                  </TouchableOpacity>
                  {formData.checkIn && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={clearCheckInDate}
                    >
                      <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {errors.checkIn && (
                  <Text style={styles.errorText}>{errors.checkIn}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>📅 Check-out Date *</Text>
                <View style={styles.dateInputContainer}>
                  <TouchableOpacity
                    style={[
                      styles.datePickerButton,
                      errors.checkOut && styles.inputError,
                    ]}
                    onPress={() => {
                      setShowCheckInPicker(false);
                      setShowCheckOutPicker(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.datePickerText,
                        !formData.checkOut && styles.placeholderText,
                      ]}
                    >
                      {formData.checkOut || "Select date"}
                    </Text>
                  </TouchableOpacity>
                  {formData.checkOut && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={clearCheckOutDate}
                    >
                      <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {errors.checkOut && (
                  <Text style={styles.errorText}>{errors.checkOut}</Text>
                )}
              </View>
            </View>

            {showCheckInPicker && (
              <View>
                <DateTimePicker
                  value={checkInDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onCheckInChange}
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowCheckInPicker(false)}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {showCheckOutPicker && (
              <View>
                <DateTimePicker
                  value={checkOutDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onCheckOutChange}
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowCheckOutPicker(false)}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Room Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Select Room(s) * (Multiple allowed)
              </Text>
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
                  onPress={() => toggleRoom(room.id)}
                >
                  <View style={styles.roomCardContent}>
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      <Text style={styles.roomDescription}>
                        {room.description}
                      </Text>
                    </View>
                    {formData.rooms.includes(room.id) && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {formData.rooms.length > 0 && (
                <View style={styles.selectedRoomsContainer}>
                  <Text style={styles.selectedRoomsText}>
                    {formData.rooms.length} room(s) selected
                  </Text>
                </View>
              )}

              {errors.rooms && (
                <Text style={styles.errorText}>{errors.rooms}</Text>
              )}
            </View>
          </View>

          {/* Payment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Payment Type</Text>

            <View style={styles.paymentRow}>
              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  formData.paymentType === "deposit" &&
                    styles.paymentCardSelected,
                  errors.paymentType &&
                    !formData.paymentType &&
                    styles.inputError,
                ]}
                onPress={() => handleChange("paymentType", "deposit")}
              >
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentTitle}>Deposit</Text>
                  <Text style={styles.paymentSubtitle}>
                    Pay partial amount now
                  </Text>

                  {formData.paymentType === "deposit" && (
                    <View style={styles.depositAmountContainer}>
                      <Text style={styles.label}>💰 Deposit Amount *</Text>
                      <View style={styles.amountInputWrapper}>
                        <Text style={styles.currencySymbol}>RM</Text>
                        <TextInput
                          style={[
                            styles.amountInput,
                            errors.depositAmount && styles.inputError,
                          ]}
                          value={formData.depositAmount}
                          onChangeText={(value) =>
                            handleChange("depositAmount", value)
                          }
                          placeholder="0.00"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="decimal-pad"
                        />
                      </View>
                      {errors.depositAmount && (
                        <Text style={styles.errorText}>
                          {errors.depositAmount}
                        </Text>
                      )}
                      <Text style={styles.helperText}>
                        Enter the deposit amount you want to pay now
                      </Text>
                    </View>
                  )}
                </View>
                {formData.paymentType === "deposit" && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  formData.paymentType === "full" && styles.paymentCardSelected,
                  errors.paymentType &&
                    !formData.paymentType &&
                    styles.inputError,
                ]}
                onPress={() => handleChange("paymentType", "full")}
              >
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentTitle}>Full Payment</Text>
                  <Text style={styles.paymentSubtitle}>
                    Pay complete amount now
                  </Text>
                </View>
                {formData.paymentType === "full" && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {errors.paymentType && (
              <Text style={styles.errorText}>{errors.paymentType}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Complete Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles (keeping most existing styles, adding new ones)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
    fontStyle: "italic",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  datePickerButton: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
  },
  datePickerText: {
    fontSize: 16,
    color: "#1F2937",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  clearButton: {
    backgroundColor: "#EF4444",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  doneButton: {
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  roomCard: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  roomCardSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  roomCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  roomDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedRoomsContainer: {
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  selectedRoomsText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  paymentRow: {
    gap: 12,
  },
  paymentCard: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentCardSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  depositAmountContainer: {
    marginTop: 15,
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingLeft: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successCheckmark: {
    fontSize: 40,
    color: "#10B981",
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1F2937",
  },
  // ✅ NEW: Financial display styles
  divider: {
    height: 1,
    backgroundColor: "#D1D5DB",
    marginVertical: 12,
  },
  amountText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1F2937",
  },
  paidText: {
    fontWeight: "600",
    color: "#10B981",
  },
  balanceText: {
    fontWeight: "600",
    color: "#F59E0B",
  },
  resetButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
