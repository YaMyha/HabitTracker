import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Target, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Habit, HabitCreate } from '../types';
import { habitsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format, isToday, isBefore, addDays } from 'date-fns';

const Dashboard: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState<HabitCreate>({
    title: '',
    description: '',
    reminder_date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const habitsData = await habitsAPI.getHabits();
      setHabits(habitsData);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                
                {/* Placeholder for habit completion tracking */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Circle className="h-4 w-4" />
                    <span>Mark as completed</span>
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
