import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UtensilsCrossed, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCalculations } from '../hooks/useCalculations';
import { useLang } from '../context/LangContext';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import Button from '../components/ui/Button';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-32"
  >
    <div className={`p-3 rounded-xl w-fit ${color}`}>
      <Icon className="text-white" size={20} />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
        {value}
        {sub && <span className="text-xs font-normal text-slate-400 ml-1">{sub}</span>}
      </h3>
    </div>
  </motion.div>
);

const Dashboard = ({ setCurrentPage }) => {
  const { activeMess } = useAuth();
  const { t } = useLang();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calculate stats for current month
  const { loading, summary, memberStats } = useCalculations(activeMess?.id, currentMonth);

  if (!activeMess) return null;

  return (
    <div className="pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-baltic-blue dark:text-emerald">{t('dashboard')}</h1>
          <p className="text-sm text-slate-500">
            {activeMess.name} • {format(currentMonth, 'MMMM yyyy')}
          </p>
        </div>
        <button 
          onClick={() => setCurrentMonth(new Date())}
          className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-500 hover:text-baltic-blue"
        >
          <Calendar size={18} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={Wallet} 
          label={t('total_cost')} 
          value={loading ? '...' : `৳${summary?.totalExpense || 0}`} 
          color="bg-baltic-blue"
        />
        <StatCard 
          icon={UtensilsCrossed} 
          label={t('meal_rate')} 
          value={loading ? '...' : `৳${summary?.mealRate || 0}`} 
          color="bg-tropical-teal"
        />
        <StatCard 
          icon={Users} 
          label={t('total_meals')} 
          value={loading ? '...' : summary?.totalMeals || 0} 
          color="bg-emerald"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Due" 
          value={loading ? '...' : `৳${summary?.totalDue || 0}`} 
          color="bg-orange-500"
        />
      </div>

      {/* Member Due List (Preview) */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-slate-700 dark:text-slate-200">Member Status</h2>
          <button 
            onClick={() => setCurrentPage('members')}
            className="text-xs text-baltic-blue font-semibold flex items-center gap-1"
          >
            View All <ArrowUpRight size={14} />
          </button>
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-slate-400">Loading calculations...</div>
          ) : (
            memberStats?.map((member) => (
              <div key={member.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{member.name}</p>
                  <p className="text-xs text-slate-500">
                    {member.meals} meals • Paid: ৳{member.paid}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${parseFloat(member.due) > 0 ? 'text-red-500' : 'text-emerald'}`}>
                    ৳{member.due}
                  </p>
                  <p className="text-[10px] text-slate-400">Net Due</p>
                </div>
              </div>
            )).reverse().slice(0, 3) // Show top 3
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="secondary" 
          onClick={() => setCurrentPage('expenses')}
          icon={Wallet}
        >
          Add Expense
        </Button>
        <Button 
          variant="primary" 
          onClick={() => setCurrentPage('meals')}
          icon={UtensilsCrossed}
        >
          Log Meals
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
