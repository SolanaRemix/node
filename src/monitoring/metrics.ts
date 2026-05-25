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
    const avgDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
    const successRate = recentMetrics.filter(m => m.status === 'success').length / recentMetrics.length;
    
    return `
╔════════════════════════════════════════════════════════════╗
║              📊 PERFORMANCE REPORT                        ║
╠════════════════════════════════════════════════════════════╣
║ Average Duration: ${avgDuration.toFixed(2)}s${' '.repeat(40 - (avgDuration.toFixed(2).Length + 18))}║
║ Success Rate: ${(successRate * 100).toFixed(1)}%${' '.repeat(40 - ((successRate * 100).toFixed(1).Length + 15))}║
║ Total Runs: ${this.metrics.length}${' '.repeat(40 - (this.metrics.length.ToString().Length + 13))}║
║ Alert Thresholds: ${this.alertThresholds.maxDuration}s${' '.repeat(40 - (this.alertThresholds.maxDuration.ToString().Length + 19))}║
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
}
