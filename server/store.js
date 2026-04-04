// In-memory database store (works without MongoDB for hackathon demo)
// Data persists as long as the server is running

export const db = {
  users: [
    {
      id: 'demo-worker-1',
      name: 'Rahul Kumar',
      phone: '9876543210',
      platform: 'zomato',
      city: 'Mumbai',
      zone: '4B',
      gpsLat: 19.0760,
      gpsLng: 72.8777,
      createdAt: new Date('2025-03-15').toISOString(),
      riskScore: 32,
      totalEarningsProtected: 14200
    },
    {
      id: 'demo-worker-2',
      name: 'Priya Sharma',
      phone: '9876543211',
      platform: 'swiggy',
      city: 'Delhi',
      zone: '2A',
      gpsLat: 28.6139,
      gpsLng: 77.2090,
      createdAt: new Date('2025-03-20').toISOString(),
      riskScore: 58,
      totalEarningsProtected: 8400
    }
  ],
  
  policies: [
    {
      id: 'policy-demo-1',
      userId: 'demo-worker-1',
      plan: 'standard',
      weeklyPremium: 59,
      dailyCoverage: 850,
      weeklyCoverage: 5950,
      startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'active',
      autoRenew: true,
      aiRecommended: true,
      riskFactors: ['monsoon_zone', 'high_aqi_area'],
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    }
  ],
  
  claims: [
    {
      id: 'claim-demo-1',
      userId: 'demo-worker-1',
      policyId: 'policy-demo-1',
      triggerType: 'heavy_rainfall',
      triggerData: { rainfall: 34.2, unit: 'mm/hr', source: 'IMD', threshold: 30 },
      location: { lat: 19.0760, lng: 72.8777, zone: '4B', area: 'Andheri' },
      payoutAmount: 480,
      status: 'settled',
      fraudFlag: false,
      fraudScore: 0.12,
      verifiedGPS: true,
      settleTime: 87,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      settledAt: new Date(Date.now() - 2 * 3600000 + 87000).toISOString(),
      paymentMethod: 'UPI',
      paymentRef: 'UPI-REF-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    },
    {
      id: 'claim-demo-2',
      userId: 'demo-worker-1',
      policyId: 'policy-demo-1',
      triggerType: 'severe_aqi',
      triggerData: { aqi: 312, category: 'Hazardous', source: 'CPCB', threshold: 200 },
      location: { lat: 19.0760, lng: 72.8777, zone: '4B', area: 'Andheri' },
      payoutAmount: 200,
      status: 'settled',
      fraudFlag: false,
      fraudScore: 0.08,
      verifiedGPS: true,
      settleTime: 62,
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      settledAt: new Date(Date.now() - 24 * 3600000 + 62000).toISOString(),
      paymentMethod: 'UPI',
      paymentRef: 'UPI-REF-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    }
  ],
  
  alerts: [
    {
      id: 'alert-1',
      type: 'heavy_rainfall',
      title: 'Heavy Rainfall Warning',
      description: '34mm/hr expected 2–5 PM in Zone 4B',
      severity: 'high',
      zone: '4B',
      city: 'Mumbai',
      triggerValue: 34.2,
      threshold: 30,
      payoutTriggered: true,
      payoutAmount: 480,
      createdAt: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: 'alert-2',
      type: 'severe_aqi',
      title: 'AQI Severe Alert',
      description: 'Air quality index at 312 - Hazardous level',
      severity: 'high',
      zone: '2A',
      city: 'Delhi',
      triggerValue: 312,
      threshold: 200,
      payoutTriggered: true,
      payoutAmount: 200,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'alert-3',
      type: 'extreme_heat',
      title: 'Extreme Heat Advisory',
      description: 'Temperature expected to reach 43°C',
      severity: 'medium',
      zone: '3A',
      city: 'Jaipur',
      triggerValue: 43,
      threshold: 42,
      payoutTriggered: false,
      payoutAmount: 0,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ]
};

// Helper to generate IDs
export const generateId = (prefix = '') => {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
