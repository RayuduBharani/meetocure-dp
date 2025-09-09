import React, { useState, useEffect } from "react";
import TopIcons from "../../../components/TopIcons";
import StatsCard from "../../../components/StatsCard";
import EarningsChart from "../../../components/EarningsChart";
import PatientInsights from "../../../components/PatientInsights";
import FinancialDashboard from "../../../components/FinancialDashboard";
import {
  DollarSign,
  Users,
  CalendarCheck,
  CalendarX2,
  RotateCcw,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Wallet,
  CreditCard,
  Banknote,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { getDoctorStats } from "../../../lib/doctorApi";

// Enhanced stats data with real-time integration
const QuickStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real stats from API
  const fetchStats = async () => {
    try {
      setLoading(true);
      const statsData = await getDoctorStats();
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
      // Fallback to dummy data
      setStats({
        todayAppointments: 6,
        pendingAppointments: 3,
        acceptedAppointments: 8,
        monthlyAppointments: 45,
        yearlyAppointments: 320,
        uniquePatients: 48,
        completedAppointments: 280,
        cancelledAppointments: 25,
        totalEarnings: 125000,
        monthlyEarnings: 12500,
        yearlyEarnings: 125000,
        todayEarnings: 1500,
        weeklyEarnings: 8500,
        avgEarningsPerPatient: 2604,
        monthlyGrowth: 12.5,
        appointmentGrowth: 8.3,
        completionRate: 91.8,
        consultationFee: 500,
        monthlyCompletedAppointments: 25,
        monthlyCancelledAppointments: 2,
        appointmentTypes: { virtual: 35, in_person: 10 },
        patientAgeGroups: { '18-29': 15, '30-44': 20, '45-59': 10, '60+': 3 },
        genderDistribution: { male: 25, female: 23 }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Enhanced stats cards with more detailed information
  const enhancedStats = [
  {
    title: "Total Earnings",
      value: `₹${stats?.totalEarnings?.toLocaleString() || '0'}`,
      subtitle: `₹${stats?.monthlyEarnings?.toLocaleString() || '0'} this month`,
    color: "text-green-600",
    bg: "bg-green-100",
    icon: <DollarSign className="w-6 h-6" />,
      trend: stats?.monthlyGrowth || 0,
      trendLabel: "vs last month",
      period: "All Time"
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats?.monthlyEarnings?.toLocaleString() || '0'}`,
      subtitle: `₹${stats?.todayEarnings?.toLocaleString() || '0'} today`,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      icon: <Wallet className="w-6 h-6" />,
      trend: stats?.monthlyGrowth || 0,
      trendLabel: "vs last month",
      period: "This Month"
    },
    {
      title: "Total Patients",
      value: stats?.uniquePatients || 0,
      subtitle: `${stats?.monthlyAppointments || 0} appointments this month`,
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: <Users className="w-6 h-6" />,
      trend: stats?.appointmentGrowth || 0,
      trendLabel: "vs last month",
      period: "All Time"
  },
  {
      title: "Today's Appointments",
      value: stats?.todayAppointments || 0,
      subtitle: `${stats?.pendingAppointments || 0} pending`,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    icon: <CalendarCheck className="w-6 h-6" />,
      trend: null,
      period: "Today"
    },
    {
      title: "Completion Rate",
      value: `${stats?.completionRate || 0}%`,
      subtitle: `${stats?.completedAppointments || 0} completed`,
      color: "text-purple-600",
      bg: "bg-purple-100",
      icon: <Target className="w-6 h-6" />,
      trend: null,
      period: "All Time"
    },
    {
      title: "Avg. Earnings/Patient",
      value: `₹${stats?.avgEarningsPerPatient?.toLocaleString() || '0'}`,
      subtitle: `₹${stats?.consultationFee || 0} consultation fee`,
    color: "text-amber-600",
    bg: "bg-amber-100",
      icon: <TrendingUp className="w-6 h-6" />,
      trend: null,
      period: "All Time"
    },
    {
      title: "Weekly Earnings",
      value: `₹${stats?.weeklyEarnings?.toLocaleString() || '0'}`,
      subtitle: "Last 7 days",
      color: "text-cyan-600",
      bg: "bg-cyan-100",
      icon: <Activity className="w-6 h-6" />,
      trend: null,
      period: "This Week"
    },
    {
      title: "Cancelled Appointments",
      value: stats?.cancelledAppointments || 0,
      subtitle: `${stats?.monthlyCancelledAppointments || 0} this month`,
      color: "text-red-600",
      bg: "bg-red-100",
      icon: <CalendarX2 className="w-6 h-6" />,
      trend: null,
      period: "All Time"
    },
  ];

  // Period filter options
  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'yearly', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  // Tab options
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'earnings', label: 'Earnings', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <PieChart className="w-4 h-4" /> }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {enhancedStats.slice(0, 4).map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
            bg={stat.bg}
            trend={stat.trend}
            trendLabel={stat.trendLabel}
            period={stat.period}
          />
        ))}
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {enhancedStats.slice(4).map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
            bg={stat.bg}
            trend={stat.trend}
            trendLabel={stat.trendLabel}
            period={stat.period}
          />
        ))}
      </div>

      {/* Earnings Chart */}
      <EarningsChart 
        title="Monthly Earnings Trend"
        data={stats?.monthlyTrend || []}
        height={250}
      />
    </div>
  );

  const renderEarningsTab = () => (
    <FinancialDashboard 
      financialData={{
        totalEarnings: stats?.totalEarnings || 0,
        monthlyEarnings: stats?.monthlyEarnings || 0,
        weeklyEarnings: stats?.weeklyEarnings || 0,
        todayEarnings: stats?.todayEarnings || 0,
        yearlyEarnings: stats?.yearlyEarnings || 0,
        averageEarningsPerPatient: stats?.avgEarningsPerPatient || 0,
        consultationFee: stats?.consultationFee || 0,
        monthlyGrowth: stats?.monthlyGrowth || 0,
        yearlyGrowth: 0,
        paymentMethods: {
          credit_card: { count: 25, amount: 12500 },
          upi: { count: 15, amount: 7500 },
          wallet: { count: 8, amount: 4000 }
        },
        earningsByMonth: [
          { month: 'Jan', earnings: 8500 },
          { month: 'Feb', earnings: 9200 },
          { month: 'Mar', earnings: 10800 },
          { month: 'Apr', earnings: 12500 },
          { month: 'May', earnings: 11800 },
          { month: 'Jun', earnings: 13200 }
        ],
        topEarningDays: [
          { date: '2024-01-15', earnings: 2500, appointments: 5 },
          { date: '2024-01-22', earnings: 2000, appointments: 4 },
          { date: '2024-01-28', earnings: 1800, appointments: 3 }
        ],
        refunds: 500,
        pendingPayments: 1200
      }}
      onExport={() => console.log('Export earnings data')}
      onFilter={() => console.log('Filter earnings data')}
    />
  );

  const renderPatientsTab = () => (
    <PatientInsights 
      patientData={{
        totalPatients: stats?.uniquePatients || 0,
        newPatients: 8,
        returningPatients: stats?.uniquePatients - 8 || 0,
        ageGroups: stats?.patientAgeGroups || {},
        genderDistribution: stats?.genderDistribution || {},
        topConditions: [
          { name: 'General Consultation', count: 25 },
          { name: 'Follow-up', count: 15 },
          { name: 'Emergency', count: 8 }
        ]
      }}
      appointmentData={{
        totalAppointments: stats?.monthlyAppointments || 0,
        completedAppointments: stats?.completedAppointments || 0,
        cancelledAppointments: stats?.cancelledAppointments || 0,
        averageSessionDuration: 30,
        peakHours: ['10:00', '14:00', '16:00'],
        appointmentTypes: stats?.appointmentTypes || {}
      }}
      insights={{
        patientSatisfaction: 92,
        retentionRate: 78,
        referralRate: 15,
        averageWaitTime: 5
      }}
    />
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Appointment Types */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(stats?.appointmentTypes || {}).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  type === 'virtual' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {type === 'virtual' ? (
                    <Activity className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Users className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <span className="text-gray-700 capitalize">{type.replace('_', ' ')}</span>
              </div>
              <span className="text-xl font-bold text-gray-800">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Success Rate</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{stats?.completionRate || 0}%</h3>
          <p className="text-gray-500 text-sm">Appointment completion</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Monthly Growth</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">
            {stats?.monthlyGrowth >= 0 ? '+' : ''}{stats?.monthlyGrowth || 0}%
          </h3>
          <p className="text-gray-500 text-sm">Revenue growth</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Avg. Fee</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">₹{stats?.consultationFee || 0}</h3>
          <p className="text-gray-500 text-sm">Per consultation</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-poppins p-6">
        <TopIcons />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A4D68]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-poppins p-6">
      <TopIcons />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0A4D68] to-[#1e6b8a] bg-clip-text text-transparent">
            Doctor Statistics
      </h1>
          <p className="text-gray-600 mt-1">Comprehensive analytics and insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4D68]"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={fetchStats}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          
          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0A4D68] text-white rounded-lg hover:bg-[#1e6b8a] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
            </div>
          </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0A4D68] text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'earnings' && renderEarningsTab()}
        {activeTab === 'patients' && renderPatientsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>
    </div>
  );
};

export default QuickStatsPage;
