import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Target, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Habit, HabitCreate, Record } from '../types';
import { habitsAPI, recordsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format, isToday, isBefore, startOfMonth, endOfMonth, addMonths } from 'date-fns';

const Dashboard: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState<HabitCreate>({
    title: '',
    description: '',
    reminder_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [recordsByHabit, setRecordsByHabit] = useState<{ [key: number]: Record[] }>({});
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const habitsData = await habitsAPI.getHabits();
      setHabits(habitsData);
      // Load records for each habit
      const recordsPromises = habitsData.map(async (h) => {
        const recs = await recordsAPI.getRecords(h.id);
        return [h.id, recs] as [number, Record[]];
      });
      const results = await Promise.all(recordsPromises);
      const map: { [key: number]: Record[] } = {};
      results.forEach(([hid, recs]) => { map[hid] = recs; });
      setRecordsByHabit(map);
    } catch (error: any) {
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.title.trim()) return;

    try {
      const habit = await habitsAPI.createHabit(newHabit);
      setHabits([...habits, habit]);
      setNewHabit({ title: '', description: '', reminder_date: format(new Date(), 'yyyy-MM-dd') });
      setShowAddForm(false);
      toast.success('Habit created successfully!');
    } catch (error: any) {
      toast.error('Failed to create habit');
    }
  };

  const handleDeleteHabit = async (habitId: number) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;

    try {
      await habitsAPI.deleteHabit(habitId);
      setHabits(habits.filter(h => h.id !== habitId));
      toast.success('Habit deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete habit');
    }
  };

  const getHabitStatus = (habit: Habit) => {
    const today = new Date();
    const reminderDate = habit.reminder_date ? new Date(habit.reminder_date) : today;
    
    if (isToday(reminderDate)) {
      return 'due-today';
    } else if (isBefore(reminderDate, today)) {
      return 'overdue';
    } else {
      return 'upcoming';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'due-today':
        return 'text-orange-600 bg-orange-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      case 'upcoming':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'due-today':
        return 'Due Today';
      case 'overdue':
        return 'Overdue';
      case 'upcoming':
        return 'Upcoming';
      default:
        return 'Unknown';
    }
  };

  const isCompletedToday = (habitId: number) => {
    const list: Record[] = recordsByHabit[habitId] || [];
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return list.some((r) => format(new Date(r.date), 'yyyy-MM-dd') === todayStr);
  };

  const getTodayRecord = (habitId: number): Record | undefined => {
    const list: Record[] = recordsByHabit[habitId] || [];
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return list.find((r) => format(new Date(r.date), 'yyyy-MM-dd') === todayStr);
  };

  const hasRecordOn = (habitId: number, date: Date) => {
    const list = recordsByHabit[habitId] || [];
    const target = date.toISOString().slice(0, 10);
    return list.some((r) => r.date.slice(0, 10) === target);
  };

  const getAllDaysOfMonth = (monthDate: Date) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days: Date[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  };

  const prevMonth = () => setCurrentMonth((d) => addMonths(d, -1));
  const nextMonth = () => setCurrentMonth((d) => addMonths(d, 1));

  const toggleToday = async (habitId: number) => {
    try {
      if (isCompletedToday(habitId)) {
        const rec = getTodayRecord(habitId);
        if (rec) {
          await recordsAPI.deleteRecord(habitId, rec.id);
          // update local state
          setRecordsByHabit((prev: any) => {
            const copy = { ...(prev || {}) };
            copy[habitId] = (copy[habitId] || []).filter((r: Record) => r.id !== rec.id);
            return copy;
          });
          toast.success('Marked as not completed');
        }
      } else {
        const created = await recordsAPI.createRecord(habitId, new Date().toISOString());
        setRecordsByHabit((prev: any) => {
          const copy = { ...(prev || {}) };
          copy[habitId] = [ ...(copy[habitId] || []), created ];
          return copy;
        });
        toast.success('Marked as completed');
      }
    } catch (e) {
      toast.error('Failed to update record');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month selector */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="btn-secondary">Prev</button>
        <div className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button onClick={nextMonth} className="btn-secondary">Next</button>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Habits</h1>
          <p className="text-gray-600">Track your daily habits and build better routines</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Habit</h2>
          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Habit Title *
              </label>
              <input
                type="text"
                id="title"
                value={newHabit.title}
                onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                className="input-field mt-1"
                placeholder="e.g., Drink 8 glasses of water"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={newHabit.description || ''}
                onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                className="input-field mt-1"
                rows={3}
                placeholder="Optional description..."
              />
            </div>
            
            <div>
              <label htmlFor="reminder_date" className="block text-sm font-medium text-gray-700">
                Reminder Date
              </label>
              <input
                type="date"
                id="reminder_date"
                value={newHabit.reminder_date || ''}
                onChange={(e) => setNewHabit({ ...newHabit, reminder_date: e.target.value })}
                className="input-field mt-1"
              />
            </div>
            
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Create Habit
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="card text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-4">Start building better habits by adding your first one!</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Add Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => {
            const status = getHabitStatus(habit);
            return (
              <div key={habit.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{habit.title}</h3>
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                {habit.description && (
                  <p className="text-gray-600 text-sm mb-3">{habit.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {habit.reminder_date ? format(new Date(habit.reminder_date), 'MMM dd, yyyy') : 'No date set'}
                    </span>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </span>
                </div>
                
                {/* Habit completion tracking */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleToday(habit.id)}
                    className="w-full flex items-center justify-center space-x-2 text-sm text-gray-700 hover:text-primary-700"
                  >
                    {isCompletedToday(habit.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Completed Today</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4" />
                        <span>Mark as completed</span>
                      </>
                    )}
                  </button>
                  {/* Month calendar grid */}
                  <div className="mt-4">
                    <div className="grid grid-cols-7 gap-1 text-[10px] text-gray-500 mb-1">
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                        <div key={d} className="text-center">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const days = getAllDaysOfMonth(currentMonth);
                        const leadingBlanks = new Date(days[0]).getDay();
                        const blanks = Array.from({ length: leadingBlanks });
                        return (
                          <>
                            {blanks.map((_, i) => (
                              <div key={`b-${i}`} />
                            ))}
                            {days.map((d) => {
                              const done = hasRecordOn(habit.id, d);
                              const isTodayFlag = format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                              return (
                                <div
                                  key={d.toISOString()}
                                  className={`h-8 rounded-md flex items-center justify-center text-xs border ${done ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'} ${isTodayFlag ? 'ring-2 ring-primary-400' : ''}`}
                                  title={format(d, 'PPP')}
                                >
                                  {format(d, 'd')}
                                </div>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-100 border border-green-200 inline-block" /> Completed</div>
                      <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-gray-50 border border-gray-200 inline-block" /> Not completed</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
