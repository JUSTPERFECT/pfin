import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';
import { useTransactions, useSettings } from '../hooks';
import { Card, Button } from '../components/ui';
import { formatCurrency } from '../utils';
import { Transaction } from '../types';
import { CATEGORY_ICONS, CurrencyCode } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';

// Function to get the start of a day
const getDayStart = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Group transactions by category
const groupByCategory = (transactions: Transaction[]) => {
  return transactions.reduce((acc, transaction) => {
    const { category } = transaction;
    if (!acc[category]) {
      acc[category] = {
        items: [],
        total: 0,
      };
    }
    acc[category].items.push(transaction);
    acc[category].total += transaction.amount;
    return acc;
  }, {} as Record<string, { items: Transaction[]; total: number }>);
};

const CalendarScreen: React.FC = () => {
  const { theme } = useTheme();
  const { transactions } = useTransactions();
  const { currency } = useSettings();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isYearPickerVisible, setYearPickerVisibility] = useState(false);

  // Generate years from 2020 to current year + 10
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  }, []);

  // Memoize marked dates to prevent re-calculation on every render
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    transactions.forEach((transaction: Transaction) => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      if (!marks[date]) {
        marks[date] = { marked: true, dotColor: theme.colors.mint };
      }
    });
    // Add selected day styling
    if (marks[selectedDate]) {
      marks[selectedDate].selected = true;
      marks[selectedDate].selectedColor = theme.colors.mint;
      marks[selectedDate].dotColor = theme.colors.dark;
    } else {
      marks[selectedDate] = { selected: true, selectedColor: theme.colors.mint };
    }
    return marks;
  }, [transactions, selectedDate, theme.colors]);

  // Memoize transactions for the selected day
  const selectedDayTransactions = useMemo(() => {
    const startOfSelectedDay = getDayStart(new Date(selectedDate));
    return transactions.filter((t: Transaction) => getDayStart(new Date(t.date)).getTime() === startOfSelectedDay.getTime());
  }, [transactions, selectedDate]);

  // Memoize total spent for the selected day
  const totalSpent = useMemo(() => {
    return selectedDayTransactions.reduce((sum: number, t: Transaction) => t.type === 'expense' ? sum + t.amount : sum, 0);
  }, [selectedDayTransactions]);

  const groupedTransactions = useMemo(() => groupByCategory(selectedDayTransactions), [selectedDayTransactions]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const onMonthChange = (month: DateData) => {
    setCurrentMonth(new Date(month.timestamp));
  };

  const showYearPicker = () => {
    setYearPickerVisibility(true);
  };

  const hideYearPicker = () => {
    setYearPickerVisibility(false);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    hideYearPicker();
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const goToPreviousYear = () => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextYear = () => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentMonth(newDate);
  };

  const renderCalendarHeader = () => (
    <View style={styles.calendarHeader}>
      <View style={styles.yearNavigation}>
        <TouchableOpacity 
          onPress={goToPreviousYear}
          style={[styles.yearButton, { borderColor: theme.colors.border }]}
        >
          <Text style={[styles.yearButtonText, { color: theme.colors.text }]}>◀◀</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={showYearPicker}
          style={[styles.yearDisplay, { borderColor: theme.colors.border }]}
        >
          <Text style={[styles.yearText, { color: theme.colors.text }]}>
            {currentMonth.getFullYear()}
          </Text>
          <Text style={[styles.yearLabel, { color: theme.colors.textSecondary }]}>
            Tap to change
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={goToNextYear}
          style={[styles.yearButton, { borderColor: theme.colors.border }]}
        >
          <Text style={[styles.yearButtonText, { color: theme.colors.text }]}>▶▶</Text>
        </TouchableOpacity>
      </View>
      
      <Button 
        variant="outline" 
        size="small" 
        onPress={goToToday}
        style={styles.todayButton}
      >
        Today
      </Button>
    </View>
  );

  const renderYearPicker = () => (
    <Modal
      visible={isYearPickerVisible}
      transparent
      animationType="slide"
      onRequestClose={hideYearPicker}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Year
            </Text>
            <TouchableOpacity onPress={hideYearPicker}>
              <Text style={[styles.modalClose, { color: theme.colors.mint }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableYears}
            keyExtractor={(year: number) => year.toString()}
            renderItem={({ item: year }: { item: number }) => (
              <TouchableOpacity
                style={[
                  styles.yearOption,
                  { borderBottomColor: theme.colors.border }
                ]}
                onPress={() => handleYearSelect(year)}
              >
                <Text style={[
                  styles.yearOptionText,
                  { 
                    color: currentMonth.getFullYear() === year 
                      ? theme.colors.mint 
                      : theme.colors.text 
                  }
                ]}>
                  {year}
                </Text>
                {currentMonth.getFullYear() === year && (
                  <Text style={[styles.checkmark, { color: theme.colors.mint }]}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            )}
            style={styles.yearList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <Card>
          {renderCalendarHeader()}
          <Calendar
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
            current={currentMonth.toISOString().split('T')[0]}
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.gray,
              selectedDayBackgroundColor: theme.colors.mint,
              selectedDayTextColor: theme.colors.dark,
              todayTextColor: theme.colors.mint,
              dayTextColor: theme.colors.text,
              textDisabledColor: theme.colors.gray,
              dotColor: theme.colors.mint,
              selectedDotColor: theme.colors.dark,
              arrowColor: theme.colors.mint,
              monthTextColor: theme.colors.text,
              indicatorColor: theme.colors.mint,
              textDayFontWeight: theme.fontWeight.normal,
              textMonthFontWeight: theme.fontWeight.bold,
              textDayHeaderFontWeight: theme.fontWeight.medium,
              textDayFontSize: theme.fontSize.md,
              textMonthFontSize: theme.fontSize.lg,
              textDayHeaderFontSize: theme.fontSize.sm,
            }}
          />
        </Card>
        
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: theme.colors.textSecondary }]}>
            {new Date(selectedDate).toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.text }]}>
            {formatCurrency(totalSpent, currency as CurrencyCode || 'INR')}
          </Text>
          <Text style={[styles.summarySubtitle, { color: theme.colors.textSecondary }]}>
            Total Spent
          </Text>
        </Card>
        
        {selectedDayTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No transactions for this date
            </Text>
          </Card>
        ) : (
          Object.entries(groupedTransactions).map(([category, data]) => (
            <View key={category}>
              <Card style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryIcon}>{CATEGORY_ICONS[category] || '💰'}</Text>
                  <Text style={[styles.categoryName, { color: theme.colors.text }]}>{category}</Text>
                  <Text style={[styles.categoryTotal, { color: theme.colors.text }]}>{formatCurrency(data.total, currency as CurrencyCode || 'INR')}</Text>
                </View>
              </Card>
              {data.items.map((item: Transaction) => (
                <Card key={item.id} style={styles.transactionCard}>
                  <Text style={[styles.transactionDescription, { color: theme.colors.textSecondary }]}>{item.description}</Text>
                  <Text style={[styles.transactionAmount, { color: item.type === 'income' ? theme.colors.income : theme.colors.expense }]}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, currency as CurrencyCode || 'INR')}
                  </Text>
                </Card>
              ))}
            </View>
          ))
        )}
      </ScrollView>
      
      {renderYearPicker()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  yearNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
  },
  yearButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  yearDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '700',
  },
  yearLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  todayButton: {
    minWidth: 60,
  },
  summaryCard: {
    alignItems: 'center',
    padding: 16,
    margin: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    margin: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#E8F5E9', // A very light green, placeholder
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  transactionDescription: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '500',
  },
  yearList: {
    maxHeight: 300,
  },
  yearOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  yearOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CalendarScreen; 