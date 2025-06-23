import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';
import { useTransactions, useSettings } from '../hooks';
import { Card } from '../components/ui';
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

  // Memoize marked dates to prevent re-calculation on every render
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    transactions.forEach(transaction => {
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
    return transactions.filter(t => getDayStart(new Date(t.date)).getTime() === startOfSelectedDay.getTime());
  }, [transactions, selectedDate]);

  // Memoize total spent for the selected day
  const totalSpent = useMemo(() => {
    return selectedDayTransactions.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0);
  }, [selectedDayTransactions]);

  const groupedTransactions = useMemo(() => groupByCategory(selectedDayTransactions), [selectedDayTransactions]);


  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <Card>
          <Calendar
            onDayPress={onDayPress}
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
          <Text style={[styles.summaryTitle, { color: theme.colors.gray }]}>Total Spent</Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.dark }]}>
            {formatCurrency(totalSpent, currency as CurrencyCode || 'INR')}
          </Text>
        </Card>
        
        {Object.entries(groupedTransactions).map(([category, data]) => (
          <View key={category}>
            <Card style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{CATEGORY_ICONS[category] || '💰'}</Text>
                <Text style={[styles.categoryName, { color: theme.colors.text }]}>{category}</Text>
                <Text style={[styles.categoryTotal, { color: theme.colors.text }]}>{formatCurrency(data.total, currency as CurrencyCode || 'INR')}</Text>
              </View>
            </Card>
            {data.items.map(item => (
              <Card key={item.id} style={styles.transactionCard}>
                <Text style={[styles.transactionDescription, { color: theme.colors.gray }]}>{item.description}</Text>
                <Text style={[styles.transactionAmount, { color: item.type === 'income' ? theme.colors.income : theme.colors.expense }]}>
                  {formatCurrency(item.amount, currency as CurrencyCode || 'INR')}
                </Text>
              </Card>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    alignItems: 'center',
    padding: 16,
    margin: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
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
});

export default CalendarScreen; 