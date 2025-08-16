import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { taskService } from '../services/taskService.ts';
import { aiService } from '../services/aiService.ts';
import { Task, TaskStatus } from '../types.ts';
import { useTranslation } from '../i18n.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { STATUS_ICONS, STATUS_VISUALS, ICONS } from '../constants.tsx';
import Modal from './ui/Modal.tsx';

const getEnumKeyByValue = <T extends object>(enumObj: T, value: string): keyof T | undefined => {
    return (Object.keys(enumObj) as Array<keyof T>).find(key => enumObj[key] === value);
}

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg h-full">
    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{title}</h3>
    <div style={{ width: '100%', height: 300 }}>
      {children}
    </div>
  </div>
);

const StatCard = React.memo(({ status, value, delay, t, isMounted, isExporting }: { 
    status: TaskStatus;
    value: number;
    delay: number;
    t: (key: string, options?: any) => string;
    isMounted: boolean;
    isExporting: boolean;
}) => {
    const statusKey = getEnumKeyByValue(TaskStatus, status);
    const title = statusKey ? t(`statuses.${statusKey}`) : status;
    const visuals = STATUS_VISUALS[status];
    const icon = STATUS_ICONS[status];
    
    return (
        <div 
            className={`p-4 rounded-lg shadow-md flex items-center space-x-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${visuals.bg} ${isExporting ? 'animate-none opacity-100' : `opacity-0 ${isMounted ? 'animate-fade-in-up' : ''}`}`}
            style={{ animationDelay: isExporting ? '0s' : `${delay}ms` }}
        >
            <div className={`p-3 rounded-full bg-white/50 dark:bg-white/10 ${visuals.icon}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary truncate">{title}</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
});

const Dashboard: React.FC = () => {
    // Suppress TypeScript errors for isAnimationActive prop due to potentially outdated types
    const AnyPieChart = PieChart as any;
    const AnyLineChart = LineChart as any;
    
    const { t, language } = useTranslation();
    const { isDark } = useTheme();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [analysisError, setAnalysisError] = useState('');
    const dashboardRef = useRef<HTMLDivElement>(null);

    const ThemedCustomizedPieLabel = useCallback((props: any) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, outerRadius, percent, name } = props;
        const effectiveIsDark = isDark && !isExporting;

        if (percent === 0 || [cx, cy, midAngle, outerRadius].some(p => p === undefined || p === null)) {
            return null;
        }

        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        
        const sx = cx + (outerRadius) * cos;
        const sy = cy + (outerRadius) * sin;
        const mx = cx + (outerRadius + 10) * cos;
        const my = cy + (outerRadius + 10) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 15;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        const strokeColor = effectiveIsDark ? '#4b5563' : '#9ca3af';
        const textColor = effectiveIsDark ? '#d1d5db' : '#374151';

        return (
            <g>
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={strokeColor} fill="none" />
                <circle cx={sx} cy={sy} r={2} fill={strokeColor} stroke="none" />
                <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} textAnchor={textAnchor} fill={textColor} dominantBaseline="central" className="text-xs font-semibold">
                    {`${name} (${(percent * 100).toFixed(0)}%)`}
                </text>
            </g>
        );
    }, [isDark, isExporting]);


    useEffect(() => {
        const mountTimer = setTimeout(() => setIsMounted(true), 10);
        return () => {
            clearTimeout(mountTimer);
        };
    }, []);

    useEffect(() => {
        const fetchTasksForChart = async () => {
            setLoading(true);
            try {
                const fetchedTasks = await taskService.getTasks();
                setTasks(fetchedTasks);
            } catch (error) {
                console.error("Failed to fetch tasks for dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasksForChart();
    }, []);
    
    useEffect(() => {
        if (!isExporting) return;

        const doExport = async () => {
            await new Promise(resolve => setTimeout(resolve, 100));

            if (!dashboardRef.current) {
                setIsExporting(false);
                return;
            }
            
            try {
                const canvas = await html2canvas(dashboardRef.current, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    onclone: (document) => {
                        document.documentElement.classList.remove('dark');
                        const exportBtn = document.getElementById('export-pdf-button');
                        if (exportBtn) exportBtn.style.visibility = 'hidden';
                        const analysisBtn = document.getElementById('ai-analysis-button');
                        if (analysisBtn) analysisBtn.style.visibility = 'hidden';
                    }
                });
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasAspectRatio = canvas.width / canvas.height;
                
                const margin = 10;
                const contentWidth = pdfWidth - (margin * 2);
                const contentHeight = pdfHeight - (margin * 2);
                
                let imgWidth = contentWidth;
                let imgHeight = imgWidth / canvasAspectRatio;

                if (imgHeight > contentHeight) {
                    imgHeight = contentHeight;
                    imgWidth = imgHeight * canvasAspectRatio;
                }
                
                const x = (pdfWidth - imgWidth) / 2;
                const y = (pdfHeight - imgHeight) / 2;

                pdf.setDrawColor(200, 200, 200);
                pdf.rect(margin - 1, margin - 1, contentWidth + 2, contentHeight + 2, 'S');

                pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
                pdf.save("dashboard-report.pdf");
            } catch (error) {
                console.error("Failed to export dashboard as PDF:", error);
            } finally {
                setIsExporting(false);
            }
        };

        doExport();
    }, [isExporting]);

    const { sCurveData, tasksByStatus, completionStatusData, statusDistributionData } = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => i);
        const monthLabels = [t('months.jan'), t('months.fev'), t('months.mar'), t('months.abr'), t('months.mai'), t('months.jun'), t('months.jul'), t('months.ago'), t('months.set'), t('months.out'), t('months.nov'), t('months.dez')];
        const currentYear = new Date().getUTCFullYear();
        
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const getEffectiveDeliveryDate = (task: Task): Date | null => {
            if (task.completionDate) {
                return new Date(task.completionDate);
            }
            const deadline = new Date(task.deadline);
            if (deadline < today && task.status !== TaskStatus.DeployFinalizado) {
                return null;
            }
            return deadline;
        };

        const sCurve = months.map(monthIndex => {
            const endOfMonth = new Date(Date.UTC(currentYear, monthIndex + 1, 0, 23, 59, 59, 999));

            const cumulativePlannedTasks = tasks.filter(t => new Date(t.deadline) <= endOfMonth);
            const cumulativePlannedHours = cumulativePlannedTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

            const cumulativeActualForecastTasks = tasks.filter(t => {
                const effectiveDate = getEffectiveDeliveryDate(t);
                return effectiveDate && effectiveDate <= endOfMonth;
            });
            const cumulativeActualHours = cumulativeActualForecastTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
            
            const startOfMonth = new Date(Date.UTC(currentYear, monthIndex, 1));

            const plannedTasksInMonth = tasks.filter(t => {
                const deadline = new Date(t.deadline);
                return deadline >= startOfMonth && deadline <= endOfMonth;
            });

            const actualTasksInMonth = tasks.filter(t => {
                const effectiveDate = getEffectiveDeliveryDate(t);
                return effectiveDate && effectiveDate >= startOfMonth && effectiveDate <= endOfMonth;
            });
            
            return {
                name: monthLabels[monthIndex],
                [t('dashboard.plannedDelivery')]: cumulativePlannedHours,
                [t('dashboard.actualDelivery')]: cumulativeActualHours,
                plannedTaskIds: plannedTasksInMonth.map(t => t.taskId),
                actualTaskIds: actualTasksInMonth.map(t => t.taskId),
                cumulativePlannedTaskCount: cumulativePlannedTasks.length,
                cumulativeActualTaskCount: cumulativeActualForecastTasks.length,
            };
        });


        const statusCounts = Object.values(TaskStatus).reduce((acc, status) => {
            acc[status] = tasks.filter(t => t.status === status).length;
            return acc;
        }, {} as Record<TaskStatus, number>);

        const completedCount = statusCounts[TaskStatus.DeployFinalizado];
        const pendingCount = tasks.length - completedCount;
        const completionData = [
            { name: t('dashboard.completed'), value: completedCount },
            { name: t('dashboard.pending'), value: pendingCount },
        ];
        
        const distributionData = Object.entries(statusCounts)
          .filter(([, count]) => count > 0)
          .map(([status, count]) => {
            const statusTyped = status as TaskStatus;
            const statusKey = getEnumKeyByValue(TaskStatus, statusTyped);
            return {
              name: statusKey ? t(`statuses.${statusKey}`) : status,
              value: count,
              color: STATUS_VISUALS[statusTyped].color,
            };
          });

        return {
            sCurveData: sCurve,
            tasksByStatus: statusCounts,
            completionStatusData: completionData,
            statusDistributionData: distributionData,
        };
    }, [tasks, t]);
    
    // Memoize chart props to prevent re-renders
    const pieChartMargin = useMemo(() => ({ top: 40, right: 40, bottom: 40, left: 40 }), []);
    const lineChartMargin = useMemo(() => ({ top: 20, right: 30, left: 20, bottom: 5 }), []);
    const lineActiveDot = useMemo(() => ({ r: 8 }), []);

    const COMPLETION_COLORS = useMemo(() => ['#10B981', '#6B7280'], []);
    
    const handleExportPDF = () => {
        if (isExporting) return;
        setIsExporting(true);
    };

    const handleAiAnalysis = async () => {
        setIsAnalysisModalOpen(true);
        setIsAnalyzing(true);
        setAnalysisResult('');
        setAnalysisError('');
        try {
            const dataForAnalysis = {
                sCurveData: sCurveData.map(d => ({
                    name: d.name,
                    planned: d[t('dashboard.plannedDelivery')] as number,
                    actual: d[t('dashboard.actualDelivery')] as number,
                })),
                tasksByStatus, 
                completionStatusData, 
                statusDistributionData,
                totalTasks: tasks.length
            };
            const result = await aiService.analyzeDashboard(dataForAnalysis, language);
            setAnalysisResult(result);
        } catch (error) {
            setAnalysisError(t('dashboard.analysisError'));
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const CustomTooltip = useCallback(({ active, payload, label }: any) => {
        if (active && payload && payload.length && label) {
            const dataPoint = sCurveData.find(d => d.name === label);
            
            if (!dataPoint) {
                return null;
            }

            const plannedData = payload.find(p => p.dataKey === t('dashboard.plannedDelivery'));
            const actualData = payload.find(p => p.dataKey === t('dashboard.actualDelivery'));
            
            const plannedTasks = dataPoint.plannedTaskIds || [];
            const actualTasks = dataPoint.actualTaskIds || [];

            return (
              <div className="bg-white dark:bg-slate-900 p-3 border border-gray-200 dark:border-dark-border rounded-lg shadow-lg text-sm">
                <p className="font-bold text-gray-800 dark:text-white mb-2">{dataPoint.name}</p>
                {plannedData && (
                  <div className="mb-2">
                    <p style={{ color: plannedData.color }}>{`${plannedData.name}: ${plannedData.value}`}</p>
                    {plannedTasks.length > 0 && 
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1 pl-2">IDs: {plannedTasks.join(', ')}</p>
                    }
                  </div>
                )}
                {actualData && (
                  <div>
                    <p style={{ color: actualData.color }}>{`${actualData.name}: ${actualData.value}`}</p>
                    {actualTasks.length > 0 && 
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1 pl-2">IDs: {actualTasks.join(', ')}</p>
                    }
                  </div>
                )}
              </div>
            );
        }
        return null;
    }, [t, sCurveData]);

    const completionTooltipFormatter = useCallback((value: number, name: string, entry: any) => {
        const total = completionStatusData.reduce((sum, item) => sum + item.value, 0);
        const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
        return `${value} (${percent}%)`;
    }, [completionStatusData]);

    const distributionTooltipFormatter = useCallback((value: number, name: string, entry: any) => {
        const total = statusDistributionData.reduce((sum, item) => sum + item.value, 0);
        const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
        return `${value} (${percent}%)`;
    }, [statusDistributionData]);

    const CustomizedLineLabel = useCallback((props: any) => {
        const { x, y, payload, dataKey } = props;
        
        if (!payload) {
            return null;
        }
        
        const keyForTaskCount = dataKey === t('dashboard.plannedDelivery') 
            ? 'cumulativePlannedTaskCount' 
            : 'cumulativeActualTaskCount';

        const taskCount = payload[keyForTaskCount];
        
        if (taskCount === undefined || taskCount === null || taskCount === 0) return null;

        const effectiveIsDark = isDark && !isExporting;
        const textColor = effectiveIsDark ? '#9ca3af' : '#555';

        return (
            <g transform={`translate(${x},${y})`}>
                <text dy={-8} textAnchor="middle" fill={textColor} className="text-xs font-semibold">
                    {taskCount}
                </text>
            </g>
        );
    }, [t, isDark, isExporting]);


    if (loading) {
        return <div className="text-center p-8">{t('dashboard.loading')}</div>;
    }

    return (
        <>
            {isExporting && (
                <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-lg font-semibold text-gray-700">{t('dashboard.generatingPDF')}</p>
                    </div>
                </div>
            )}
            <div className="space-y-8" ref={dashboardRef}>
                 <div className={`flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 ${isExporting ? 'animate-none opacity-100' : `opacity-0 ${isMounted ? 'animate-fade-in-up' : ''}`}`}>
                     <div className="flex items-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('dashboard.title')}</h2>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                            id="ai-analysis-button"
                            type="button"
                            onClick={handleAiAnalysis}
                            disabled={isAnalyzing}
                            className="bg-primary-light text-primary px-4 py-2 rounded-md hover:bg-primary/20 transition-colors shadow-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                           {ICONS.sparkles}
                           {t('dashboard.aiAnalysisButton')}
                        </button>
                        <button 
                            id="export-pdf-button"
                            type="button"
                            onClick={handleExportPDF} 
                            disabled={isExporting}
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors shadow-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            {isExporting ? t('dashboard.exporting') : t('dashboard.exportPDFButton')}
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(tasksByStatus).map(([status, count], index) => (
                      <StatCard 
                          key={status} 
                          status={status as TaskStatus} 
                          value={count} 
                          delay={100 + index * 50} 
                          t={t}
                          isMounted={isMounted}
                          isExporting={isExporting}
                      />
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={`${isExporting ? 'animate-none opacity-100' : `opacity-0 ${isMounted ? 'animate-fade-in-up' : ''}`}`} style={{ animationDelay: isExporting ? '0s' : '400ms' }}>
                        <ChartContainer title={t('dashboard.completionStatus')}>
                          <ResponsiveContainer>
                            <AnyPieChart margin={pieChartMargin}>
                              <Pie 
                                  isAnimationActive={false}
                                  data={completionStatusData} 
                                  dataKey="value" 
                                  nameKey="name" 
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={60} 
                                  outerRadius={80} 
                                  paddingAngle={5} 
                                  labelLine={false}
                                  label={ThemedCustomizedPieLabel}
                              >
                                {completionStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COMPLETION_COLORS[index % COMPLETION_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={completionTooltipFormatter}/>
                            </AnyPieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                    <div className={`${isExporting ? 'animate-none opacity-100' : `opacity-0 ${isMounted ? 'animate-fade-in-up' : ''}`}`} style={{ animationDelay: isExporting ? '0s' : '500ms' }}>
                        <ChartContainer title={t('dashboard.statusDistribution')}>
                          <ResponsiveContainer>
                            <AnyPieChart margin={pieChartMargin}>
                               <Pie 
                                  isAnimationActive={false}
                                  data={statusDistributionData} 
                                  dataKey="value" 
                                  nameKey="name" 
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={60} 
                                  outerRadius={80} 
                                  paddingAngle={5}
                                  labelLine={false}
                                  label={ThemedCustomizedPieLabel}
                              >
                                 {statusDistributionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={distributionTooltipFormatter}/>
                            </AnyPieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </div>
                
                <div className={`bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg ${isExporting ? 'animate-none opacity-100' : `opacity-0 ${isMounted ? 'animate-fade-in-up' : ''}`}`} style={{ animationDelay: isExporting ? '0s' : '600ms' }}>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{t('dashboard.sCurveTitle')}</h3>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-6">{t('dashboard.subtitle')}</p>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <AnyLineChart
                                data={sCurveData}
                                margin={lineChartMargin}
                                isAnimationActive={false}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark && !isExporting ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="name" stroke={isDark && !isExporting ? '#9ca3af' : '#6b7280'} />
                                <YAxis allowDecimals={false} stroke={isDark && !isExporting ? '#9ca3af' : '#6b7280'} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line isAnimationActive={false} type="monotone" dataKey={t('dashboard.plannedDelivery')} stroke="#A100FF" strokeWidth={2} activeDot={lineActiveDot} label={<CustomizedLineLabel />} />
                                <Line isAnimationActive={false} type="monotone" dataKey={t('dashboard.actualDelivery')} stroke="#00C49F" strokeWidth={2} label={<CustomizedLineLabel />}/>
                            </AnyLineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <Modal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} title={t('dashboard.aiAnalysisTitle')}>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center h-48">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">{t('dashboard.analyzing')}</p>
                        </div>
                    )}
                    {analysisError && <p className="text-red-600">{analysisError}</p>}
                    {!isAnalyzing && analysisResult && (
                        <div className="text-gray-700 dark:text-dark-text space-y-4 whitespace-pre-wrap">
                           {analysisResult.split('**').map((part, index) => 
                                index % 2 === 1 ? <strong key={index}>{part}</strong> : <span key={index}>{part}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 flex flex-row-reverse">
                    <button type="button" onClick={() => setIsAnalysisModalOpen(false)} className="inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:w-auto sm:text-sm">
                        {t('dashboard.close')}
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Dashboard;
