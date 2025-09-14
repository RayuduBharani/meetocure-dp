import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  Banknote, 
  Coins,
  Calendar,
  Clock,
  Target,
  PieChart,
  BarChart3,
  Download,
  Eye,
  Filter
} from 'lucide-react';

const FinancialDashboard = ({ 
  financialData = {},
  onExport = () => {},
  onFilter = () => {}
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedView, setSelectedView] = useState('overview');

  const {
    totalEarnings = 0,
    monthlyEarnings = 0,
    weeklyEarnings = 0,
    todayEarnings = 0,
    yearlyEarnings = 0,
    averageEarningsPerPatient = 0,
    consultationFee = 0,
    monthlyGrowth = 0,
    yearlyGrowth = 0,
    paymentMethods = {},
    earningsByMonth = [],
    topEarningDays = [],
    refunds = 0,
    pendingPayments = 0
  } = financialData;

  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'yearly', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const viewOptions = [
    { value: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'trends', label: 'Trends', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'breakdown', label: 'Breakdown', icon: <PieChart className="w-4 h-4" /> },
    { value: 'projections', label: 'Projections', icon: <Target className="w-4 h-4" /> }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-green-200 text-sm">Total Earnings</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">₹{totalEarnings.toLocaleString()}</h3>
          <p className="text-green-100 text-sm">All time revenue</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-blue-200 text-sm">This Month</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">₹{monthlyEarnings.toLocaleString()}</h3>
          <p className="text-blue-100 text-sm">
            {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth}% vs last month
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-purple-200 text-sm">Avg/Patient</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">₹{averageEarningsPerPatient.toLocaleString()}</h3>
          <p className="text-purple-100 text-sm">Per consultation</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-amber-200 text-sm">Today</span>
          </div>
          <h3 className="text-3xl font-bold mb-2">₹{todayEarnings.toLocaleString()}</h3>
          <p className="text-amber-100 text-sm">Current day</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Weekly Earnings</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ₹{weeklyEarnings.toLocaleString()}
          </div>
          <p className="text-gray-500 text-sm">Last 7 days</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Yearly Earnings</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            ₹{yearlyEarnings.toLocaleString()}
          </div>
          <p className="text-gray-500 text-sm">
            {yearlyGrowth >= 0 ? '+' : ''}{yearlyGrowth}% vs last year
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Consultation Fee</h3>
            <Banknote className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            ₹{consultationFee.toLocaleString()}
          </div>
          <p className="text-gray-500 text-sm">Per appointment</p>
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      {/* Earnings Trend Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Earnings Trend</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Simple trend visualization */}
        <div className="h-64 flex items-end justify-between px-4 pb-4">
          {earningsByMonth.slice(-6).map((month, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div 
                className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                style={{ 
                  height: `${(month.earnings / Math.max(...earningsByMonth.map(m => m.earnings))) * 200}px`,
                  minHeight: '20px'
                }}
              ></div>
              <span className="text-xs text-gray-500">{month.month}</span>
              <span className="text-xs font-medium text-gray-700">₹{month.earnings.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Earning Days */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Earning Days</h3>
        <div className="space-y-3">
          {topEarningDays.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{day.date}</p>
                  <p className="text-gray-500 text-sm">{day.appointments} appointments</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-600">₹{day.earnings.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBreakdown = () => (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(paymentMethods).map(([method, data]) => (
            <div key={method} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  method === 'credit_card' ? 'bg-blue-100' : 
                  method === 'upi' ? 'bg-green-100' : 
                  method === 'wallet' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {method === 'credit_card' ? <CreditCard className="w-5 h-5 text-blue-600" /> :
                   method === 'upi' ? <Coins className="w-5 h-5 text-green-600" /> :
                   method === 'wallet' ? <Wallet className="w-5 h-5 text-purple-600" /> :
                   <Banknote className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <p className="text-gray-800 font-medium capitalize">{method.replace('_', ' ')}</p>
                  <p className="text-gray-500 text-sm">{data.count} transactions</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-800">₹{data.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Total Revenue</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">₹{totalEarnings.toLocaleString()}</h3>
          <p className="text-gray-500 text-sm">All time</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Refunds</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">₹{refunds.toLocaleString()}</h3>
          <p className="text-gray-500 text-sm">Total refunded</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Pending</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">₹{pendingPayments.toLocaleString()}</h3>
          <p className="text-gray-500 text-sm">Awaiting payment</p>
        </div>
      </div>
    </div>
  );

  const renderProjections = () => (
    <div className="space-y-6">
      {/* Monthly Projections */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Projections</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h4 className="text-2xl font-bold text-blue-600 mb-2">
              ₹{(monthlyEarnings * 1.1).toLocaleString()}
            </h4>
            <p className="text-blue-600 text-sm font-medium">Next Month (10% growth)</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h4 className="text-2xl font-bold text-green-600 mb-2">
              ₹{(monthlyEarnings * 1.2).toLocaleString()}
            </h4>
            <p className="text-green-600 text-sm font-medium">Optimistic (20% growth)</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h4 className="text-2xl font-bold text-purple-600 mb-2">
              ₹{(monthlyEarnings * 0.9).toLocaleString()}
            </h4>
            <p className="text-purple-600 text-sm font-medium">Conservative (10% decline)</p>
          </div>
        </div>
      </div>

      {/* Yearly Projections */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Yearly Projections</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Current Year Target</span>
            <span className="text-lg font-bold text-gray-800">₹{(yearlyEarnings * 1.15).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Achieved</span>
            <span className="text-lg font-bold text-green-600">₹{yearlyEarnings.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Remaining</span>
            <span className="text-lg font-bold text-blue-600">
              ₹{((yearlyEarnings * 1.15) - yearlyEarnings).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Financial Dashboard</h2>
          <p className="text-gray-600">Track your earnings and financial performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
        {viewOptions.map(view => (
          <button
            key={view.value}
            onClick={() => setSelectedView(view.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === view.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {view.icon}
            {view.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {selectedView === 'overview' && renderOverview()}
      {selectedView === 'trends' && renderTrends()}
      {selectedView === 'breakdown' && renderBreakdown()}
      {selectedView === 'projections' && renderProjections()}
    </div>
  );
};

export default FinancialDashboard;
