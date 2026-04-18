// Services layer — tenant + booking + configService.
// All page content (rows, tabs, labels, stats) lives in src/assets/data/*.json
// and is fetched via configService with simulated latency.
export { tenantService, bookingService } from './tenants';
export type { Tenant, DemoBooking as Booking } from './tenants';
export { configService } from './configService';
