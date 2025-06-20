import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitInfo {
  count: number;
  resetTime: number;
  limit: number;
  lastRequestTime: number;
}

interface ThrottleLevel {
  minRequests: number;
  maxRequests: number;
  delayMs: number;
  description: string;
}

@Injectable()
export class GlobalMiddleware implements NestMiddleware {
  private readonly requestMap = new Map<string, RateLimitInfo>();
  private readonly WINDOW_MS = 60000; // 1 minute
  private readonly BASE_LIMIT = 100; // Base request limit per minute
  private readonly blockedIPs = new Map<string, number>();

  // Throttle levels
  private readonly throttleLevels: ThrottleLevel[] = [
    {
      minRequests: 0,
      maxRequests: 50,
      delayMs: 0,
      description: 'normal'
    },
    {
      minRequests: 51,
      maxRequests: 75,
      delayMs: 1000, // 1 second delay
      description: 'light'
    },
    {
      minRequests: 76,
      maxRequests: 100,
      delayMs: 3000, // 3 seconds delay
      description: 'medium'
    },
    {
      minRequests: 101,
      maxRequests: 150,
      delayMs: 5000, // 5 seconds delay
      description: 'strong'
    },
    {
      minRequests: 151,
      maxRequests: Infinity,
      delayMs: 10000, // 10 seconds delay
      description: 'critical'
    }
  ];

  // Exclusions for static files and health checks
  private readonly excludedPaths = [
    '/health',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ];

  constructor() {
    // Clean up old records every 2 minutes
    setInterval(() => {
      this.cleanupOldRecords();
    }, 120000);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const clientIP = this.getClientIP(req);
    const requestPath = req.path;
    
    // Skip excluded paths
    if (this.isExcludedPath(requestPath)) {
      return next();
    }

    // Check rate limit and get delay information
    const throttleInfo = this.checkRateLimit(clientIP);
    
    if (!throttleInfo.allowed) {
      throw new HttpException(
        {
          status: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Rate limit exceeded',
          message: 'Too many requests from your IP address',
          retryAfter: Math.ceil(throttleInfo.delayMs / 1000),
          throttleLevel: throttleInfo.level,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Apply delay if necessary
    if (throttleInfo.delayMs > 0) {
      await this.delay(throttleInfo.delayMs);
    }

    // Add headers with rate limit information
    const rateLimitInfo = this.requestMap.get(clientIP);
    if (rateLimitInfo) {
      res.setHeader('X-RateLimit-Limit', rateLimitInfo.limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimitInfo.limit - rateLimitInfo.count));
      res.setHeader('X-RateLimit-Reset', rateLimitInfo.resetTime);
      res.setHeader('X-RateLimit-ThrottleLevel', throttleInfo.level);
      res.setHeader('X-RateLimit-Delay', throttleInfo.delayMs);
    }

    next();
  }

  private isExcludedPath(path: string): boolean {
    return this.excludedPaths.some(excludedPath => path.startsWith(excludedPath));
  }

  private getClientIP(req: Request): string {
    // Get the real IP address of the client
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    
    if (typeof realIP === 'string') {
      return realIP;
    }
    
    return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  }

  private checkRateLimit(clientIP: string): { allowed: boolean; delayMs: number; level: string } {
    const now = Date.now();
    const rateLimitInfo = this.requestMap.get(clientIP);

    if (!rateLimitInfo) {
      // First request from this IP
      this.requestMap.set(clientIP, {
        count: 1,
        resetTime: now + this.WINDOW_MS,
        limit: this.BASE_LIMIT,
        lastRequestTime: now,
      });
      return { allowed: true, delayMs: 0, level: 'normal' };
    }

    // Check if the time window has expired
    if (now > rateLimitInfo.resetTime) {
      // Reset the counter
      this.requestMap.set(clientIP, {
        count: 1,
        resetTime: now + this.WINDOW_MS,
        limit: this.BASE_LIMIT,
        lastRequestTime: now,
      });
      return { allowed: true, delayMs: 0, level: 'normal' };
    }

    // Increment the counter
    rateLimitInfo.count++;
    rateLimitInfo.lastRequestTime = now;
    this.requestMap.set(clientIP, rateLimitInfo);

    // Determine the throttle level
    const throttleLevel = this.getThrottleLevel(rateLimitInfo.count);
    
    // Check if the critical limit is exceeded
    if (rateLimitInfo.count > 200) {
      return { 
        allowed: false, 
        delayMs: throttleLevel.delayMs, 
        level: throttleLevel.description 
      };
    }

    return { 
      allowed: true, 
      delayMs: throttleLevel.delayMs, 
      level: throttleLevel.description 
    };
  }

  private getThrottleLevel(requestCount: number): ThrottleLevel {
    for (const level of this.throttleLevels) {
      if (requestCount >= level.minRequests && requestCount <= level.maxRequests) {
        return level;
      }
    }
    return this.throttleLevels[this.throttleLevels.length - 1];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private cleanupOldRecords(): void {
    const now = Date.now();
    
    // Clean up old rate limit records
    for (const [ip, info] of this.requestMap.entries()) {
      if (now > info.resetTime) {
        this.requestMap.delete(ip);
        console.log(`Cleaned up record for IP: ${ip}`);
      }
    }

    // Clean up expired blocks
    for (const [ip, blockTime] of this.blockedIPs.entries()) {
      if (now > blockTime) {
        this.blockedIPs.delete(ip);
        console.log(`Released block for IP: ${ip}`);
      }
    }
  }

  // Method for getting statistics (for monitoring)
  getStats() {
    const stats = {
      activeConnections: this.requestMap.size,
      blockedIPs: this.blockedIPs.size,
      totalBlockedIPs: Array.from(this.blockedIPs.keys()),
      throttleLevels: {} as Record<string, number>,
    };

    // Count the number of IPs at each throttle level
    for (const [ip, info] of this.requestMap.entries()) {
      const level = this.getThrottleLevel(info.count);
      stats.throttleLevels[level.description] = (stats.throttleLevels[level.description] || 0) + 1;
    }

    return stats;
  }

  // Method for getting detailed information about an IP
  getIPInfo(clientIP: string) {
    const rateLimitInfo = this.requestMap.get(clientIP);
    if (!rateLimitInfo) {
      return { message: 'IP not found in active connections' };
    }

    const throttleLevel = this.getThrottleLevel(rateLimitInfo.count);
    return {
      ip: clientIP,
      requestCount: rateLimitInfo.count,
      resetTime: new Date(rateLimitInfo.resetTime).toISOString(),
      throttleLevel: throttleLevel.description,
      delayMs: throttleLevel.delayMs,
      lastRequestTime: new Date(rateLimitInfo.lastRequestTime).toISOString(),
    };
  }

  // Method for resetting data for a specific IP (for administrator)
  resetIP(clientIP: string): boolean {
    return this.requestMap.delete(clientIP);
  }

  // Method for clearing all data (for administrator)
  clearAllData(): void {
    this.requestMap.clear();
    this.blockedIPs.clear();
  }

  // Method for changing throttle settings
  updateThrottleLevels(newLevels: ThrottleLevel[]): void {
    this.throttleLevels.splice(0, this.throttleLevels.length, ...newLevels);
  }

  // Method for adding exclusions
  addExcludedPath(path: string): void {
    if (!this.excludedPaths.includes(path)) {
      this.excludedPaths.push(path);
    }
  }

  // Method for getting a list of exclusions
  getExcludedPaths(): string[] {
    return [...this.excludedPaths];
  }
} 