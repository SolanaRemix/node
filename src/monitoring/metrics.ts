/**
 * 📊 Performance Monitoring System
 * v1.3.0 - Real-time Metrics & Analytics
 */

export interface PerformanceMetrics {
  timestamp: Date;
  workflowName: string;
  duration: number;
  status: 'success' | 'failure';
  nodeVersion: string;
  repairType: string;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private alertThresholds = {
    maxDuration: 300, // seconds
    failureRate: 0.1, // 10%
    degradationPercent: 20
  };

  trackMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    console.log(`📈 Tracked: ${metric.workflowName} - ${metric.duration}s`);
    
    if (metric.duration > this.alertThresholds.maxDuration) {
      this.sendAlert('duration', metric);
    }
  }

  generateReport(): string {
    const recentMetrics = this.metrics.slice(-100);
    const avgDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / (recentMetrics.length || 1);
    const successRate = recentMetrics.length > 0 
      ? recentMetrics.filter(m => m.status === 'success').length / recentMetrics.length 
      : 1;
    
    const avgDurationStr = avgDuration.toFixed(2);
    const successRateStr = (successRate * 100).toFixed(1);
    const totalRunsStr = this.metrics.length.toString();
    const maxDurationStr = this.alertThresholds.maxDuration.toString();
    
    return `
╔════════════════════════════════════════════════════════════╗
║              📊 PERFORMANCE REPORT                        ║
╠════════════════════════════════════════════════════════════╣
║ Average Duration: ${avgDurationStr}s${' '.repeat(40 - (avgDurationStr.length + 18))}║
║ Success Rate: ${successRateStr}%${' '.repeat(40 - (successRateStr.length + 15))}║
║ Total Runs: ${totalRunsStr}${' '.repeat(40 - (totalRunsStr.length + 13))}║
║ Alert Thresholds: ${maxDurationStr}s${' '.repeat(40 - (maxDurationStr.length + 19))}║
╚════════════════════════════════════════════════════════════╝
`;
  }

  private sendAlert(type: string, metric: PerformanceMetrics): void {
    console.log(`⚠️ ALERT: ${type} threshold exceeded for ${metric.workflowName}`);
    // Send to notification system
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }
  
  getSummary(): { avgDuration: number; successRate: number; totalRuns: number } {
    const recentMetrics = this.metrics.slice(-100);
    const avgDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / (recentMetrics.length || 1);
    const successRate = recentMetrics.length > 0 
      ? recentMetrics.filter(m => m.status === 'success').length / recentMetrics.length 
      : 1;
    
    return {
      avgDuration,
      successRate,
      totalRuns: this.metrics.length
    };
  }
}
