import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Clock, CheckCircle } from 'lucide-react';

interface AnalyticsData {
    monthly: { name: string; count: number }[];
    category: { name: string; value: number }[];
    status: { name: string; value: number }[];
    priority: { name: string; value: number }[];
    performance?: {
        avgResolutionHours: number;
        categoryPerformance: {
            name: string;
            completionRate: number;
            avgRating: number;
            total: number;
            resolved: number;
        }[];
    };
}

interface AnalyticsChartsProps {
    data: AnalyticsData | null;
    loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const PRIORITY_COLORS: { [key: string]: string } = {
    low: '#2ecc71',
    medium: '#f1c40f',
    high: '#e67e22',
    critical: '#e74c3c'
};

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data, loading }) => {
    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading analytics...</div>;
    }

    if (!data) {
        return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No analytics data available</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '20px' }}>

            {/* Performance KPI Cards */}
            {data.performance && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div style={{
                        backgroundColor: 'var(--card-bg)',
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div style={{
                            padding: '15px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(52, 152, 219, 0.1)',
                            color: '#3498db'
                        }}>
                            <Clock size={32} />
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>Avg. Resolution Time</h3>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                                {data.performance.avgResolutionHours} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>hours</span>
                            </p>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'var(--card-bg)',
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div style={{
                            padding: '15px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            color: '#2ecc71'
                        }}>
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>Overall Completion</h3>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                                {data.status.find(s => s.name === 'done')?.value || 0} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>reports</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px' }}>
                {/* Monthly Trend */}
                <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Reports Trend (Last 6 Months)</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.monthly}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke="var(--accent-color)" activeDot={{ r: 8 }} name="Reports" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Performance (Completion Rate) */}
                {data.performance && (
                    <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Completion Rate by Category</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.performance.categoryPerformance} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis type="number" domain={[0, 100]} stroke="var(--text-secondary)" />
                                    <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" width={80} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                        formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                                    />
                                    <Legend />
                                    <Bar dataKey="completionRate" name="Completion Rate (%)" radius={[0, 4, 4, 0]}>
                                        {data.performance.categoryPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.completionRate > 80 ? '#2ecc71' : entry.completionRate > 50 ? '#f1c40f' : '#e74c3c'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Category Distribution */}
                <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Reports by Category</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.category}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8" name="Reports">
                                    {data.category.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Reports by Status</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.status}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.status.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={
                                            entry.name === 'pending' ? '#FFBB28' :
                                                entry.name === 'in progress' ? '#00C49F' :
                                                    entry.name === 'done' ? '#0088FE' : '#8884d8'
                                        } />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Priority Distribution */}
                <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Reports by Priority</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.priority} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis type="number" stroke="var(--text-secondary)" />
                                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" width={80} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                />
                                <Legend />
                                <Bar dataKey="value" name="Reports">
                                    {data.priority.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#8884d8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
