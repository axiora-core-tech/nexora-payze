// Services layer — tenant + booking only. All page data lives inline in pages.
export { tenantService, bookingService } from './tenants';
export type { Tenant, DemoBooking as Booking } from './tenants';
