import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ProxyService } from './proxy.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('ProxyService', () => {
  let service: ProxyService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: HttpService,
          useValue: {
            request: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('proxyRequest', () => {
    it('should proxy GET request successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { message: 'success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'request').mockReturnValue(of(mockResponse));

      const result = await service.proxyRequest('auth', '/health', 'GET');

      expect(result).toEqual({ message: 'success' });
      expect(httpService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'http://localhost:3000/health',
        data: undefined,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should proxy POST request with data', async () => {
      const mockResponse: AxiosResponse = {
        data: { access_token: 'token123' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'request').mockReturnValue(of(mockResponse));

      const postData = { username: 'admin', password: 'password' };
      const headers = { 'Authorization': 'Bearer token' };

      const result = await service.proxyRequest('auth', '/login', 'POST', postData, headers);

      expect(result).toEqual({ access_token: 'token123' });
      expect(httpService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://localhost:3000/login',
        data: postData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
      });
    });

    it('should handle unknown service', async () => {
      await expect(service.proxyRequest('unknown', '/test')).rejects.toThrow('Unknown service: unknown');
    });

    it('should handle HTTP errors', async () => {
      const error = new Error('Service unavailable');
      (error as any).response = {
        status: 500,
        statusText: 'Internal Server Error',
        data: { message: 'Service error' },
      };

      jest.spyOn(httpService, 'request').mockReturnValue(throwError(() => error));

      await expect(service.proxyRequest('auth', '/health')).rejects.toThrow('Service auth error: Service unavailable');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network Error');
      (error as any).code = 'ECONNREFUSED';

      jest.spyOn(httpService, 'request').mockReturnValue(throwError(() => error));

      await expect(service.proxyRequest('auth', '/health')).rejects.toThrow('Service auth error: Network Error');
    });

    it('should proxy to correct service URLs', async () => {
      const mockResponse: AxiosResponse = {
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'request').mockReturnValue(of(mockResponse));

      // Test different services
      await service.proxyRequest('crm', '/customers');
      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'http://localhost:3002/customers' })
      );

      await service.proxyRequest('stock', '/products');
      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'http://localhost:3003/products' })
      );

      await service.proxyRequest('sales', '/orders');
      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'http://localhost:3004/orders' })
      );
    });
  });
});</content>
<parameter name="filePath">/W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/nexo-prj/apps/api-gateway/src/proxy/proxy.spec.ts