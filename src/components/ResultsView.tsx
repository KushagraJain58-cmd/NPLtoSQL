import React, { useState, useMemo, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Pagination } from './Pagination';

interface ResultsViewProps {
  data: any[] | null;
  sqlQuery: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function ResultsView({ data, sqlQuery }: ResultsViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChart, setSelectedChart] = useState('line');
  const [activeView, setActiveView] = useState('table');
  const itemsPerPage = 10;

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(row => {
      const processedRow: Record<string, any> = {};
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'bigint') {
          processedRow[key] = Number(value);
        } else if (key.toLowerCase().includes('date') && typeof value === 'number') {
          processedRow[key] = formatDate(value);
        } else {
          processedRow[key] = value;
        }
      }
      return processedRow;
    });
  }, [data]);

  const columns = useMemo(() => processedData.length > 0 ? Object.keys(processedData[0]) : [], [processedData]);
  const numericColumns = useMemo(() => columns.filter(col => typeof processedData[0][col] === 'number'), [columns, processedData]);

  const totalPages = useMemo(() => Math.ceil(processedData.length / itemsPerPage), [processedData, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const renderChart = useCallback(() => {
    const chartData = processedData.map(row => {
      const chartRow: Record<string, any> = { ...row };
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'string' && value.match(/^\d{2}-\d{2}-\d{4}$/)) {
          chartRow[key] = new Date(value.split('-').reverse().join('-')).getTime();
        }
      }
      return chartRow;
    });

    const commonProps = {
      width: 800,
      height: 400,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const chartTheme = {
      backgroundColor: 'transparent',
      textColor: 'text-gray-600 dark:text-gray-300'
    };

    switch (selectedChart) {
      case 'line':
        return (
          <LineChart {...commonProps} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={columns[0]} stroke="#9CA3AF" tickFormatter={(value) => typeof value === 'number' ? formatDate(value) : value} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#E5E7EB' }}
              itemStyle={{ color: '#E5E7EB' }}
              labelFormatter={(value) => typeof value === 'number' ? formatDate(value) : value}
            />
            <Legend wrapperStyle={{ color: '#E5E7EB' }} />
            {numericColumns.map((col, i) => (
              <Line key={col} type="monotone" dataKey={col} stroke={COLORS[i % COLORS.length]} />
            ))}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData}>
            <XAxis dataKey={columns[0]} stroke="#9CA3AF" tickFormatter={(value) => typeof value === 'number' ? formatDate(value) : value} />
            <YAxis stroke="#9CA3AF" />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#E5E7EB' }}
              itemStyle={{ color: '#E5E7EB' }}
              labelFormatter={(value) => typeof value === 'number' ? formatDate(value) : value} />
            <Legend wrapperStyle={{ color: '#E5E7EB' }} />
            {numericColumns.map((col, i) => (
              <Bar key={col} dataKey={col} fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData}>
            <XAxis dataKey={columns[0]} stroke="#9CA3AF" tickFormatter={(value) => typeof value === 'number' ? formatDate(value) : value} />
            <YAxis stroke="#9CA3AF" />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#E5E7EB' }}
              itemStyle={{ color: '#E5E7EB' }}
              labelFormatter={(value) => typeof value === 'number' ? formatDate(value) : value} />
            <Legend wrapperStyle={{ color: '#E5E7EB' }} />
            {numericColumns.map((col, i) => (
              <Area key={col} type="monotone" dataKey={col} stroke="#8884d8" fill={COLORS[i % COLORS.length]} />
            ))}

          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart data={chartData}>
            <XAxis dataKey={columns[0]} stroke="#9CA3AF" tickFormatter={(value) => typeof value === 'number' ? formatDate(value) : value} />
            <YAxis stroke="#9CA3AF" />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#E5E7EB' }}
              itemStyle={{ color: '#E5E7EB' }}
              labelFormatter={(value) => typeof value === 'number' ? formatDate(value) : value} />
            <Legend wrapperStyle={{ color: '#E5E7EB' }} />
            {numericColumns.map((col, i) => (
              <Scatter key={col} type="monotone" dataKey={col} stroke="#8884d8" fill={COLORS[i % COLORS.length]} />
            ))}
          </ScatterChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie data={chartData} dataKey={col} nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      default:
        return <div>Invalid chart type</div>;
      // ... (other chart types remain the same)
    }
  }, [data, selectedChart, processedData, columns, numericColumns]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-300">No results to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sqlQuery && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Generated SQL Query:</h3>
          <pre className="bg-white dark:bg-gray-900 p-4 rounded-lg text-gray-800 dark:text-gray-200 overflow-x-auto border border-gray-200 dark:border-gray-700 text-sm">{sqlQuery}</pre>
        </div>
      )}

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setActiveView('table')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeView === 'table'
            ? 'bg-blue-500 dark:bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
        >
          Table
        </button>
        <button
          onClick={() => setActiveView('plot')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeView === 'plot'
            ? 'bg-blue-500 dark:bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
        >
          Plots
        </button>
      </div>

      {activeView === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {columns.map(col => (
                      <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {activeView === 'plot' && numericColumns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <label htmlFor="chart-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Chart Type:
            </label>
            <select
              id="chart-type"
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="area">Area Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={400}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

